import type {
  ComponentType,
  Context,
  Dispatch,
  ReactNode,
  SetStateAction,
} from 'react';
import '@remix-run/react';
import type { ClientRoute } from '@remix-run/react/routes';
import type {
  HandoffData,
  PolyglotOptionsGetter,
  PolyglotWithStaticLocale,
} from './common';
import type { Params } from 'react-router';
import {
  getRouteNamespaces,
  getGlobalName,
  isRecordOfStrings,
  isRecord,
  initiatePolyglot,
} from './common';
import { RemixEntryContext } from '@remix-run/react/components';
import {
  useContext,
  createContext,
  useState,
  createElement,
  Fragment,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

export type { PolyglotWithStaticLocale } from './common';

type ContextType<T extends Context<any>> = Parameters<
  Parameters<T['Consumer']>[0]['children']
>[0];
interface Caches {
  phrases: Record<string, Promise<Record<string, any>> | undefined>;
  indexes: Record<string, Promise<Record<string, string>> | undefined>;
}
type RemixEntryContextType = Exclude<
  ContextType<typeof RemixEntryContext>,
  undefined
>;

export function useRemixEntryContext(): RemixEntryContextType {
  const context = useContext(RemixEntryContext);

  if (!context) {
    throw new Error('Could not use remix entry context outside of Remix');
  }

  return context;
}

interface RemixPolyglotContextType {
  loadPhrases: (namespace: string | string[], locale?: string) => Promise<void>;
  store: Record<string, PolyglotWithStaticLocale>;
  _patched: symbol;
  setLocale: Dispatch<SetStateAction<string>>;
  getLocaleFromUrl?: (url: URL, params: Params<string>) => string | undefined;
  routeNamespaces: HandoffData['routeNamespaces'];
  initialPreload: string[];
  locale: string;
}

const RemixPolyglotContext = createContext<
  undefined | RemixPolyglotContextType
>(undefined);

interface SetupOptions {
  manifest: Record<string, string>;
  fetch?: typeof fetch;
  getLocaleFromUrl?: RemixPolyglotContextType['getLocaleFromUrl'];
  polyglotOptions?: PolyglotOptionsGetter;
}

export async function setup(
  options: SetupOptions,
): Promise<ComponentType<{ children?: ReactNode }>> {
  const handoffData = (window as any)[getGlobalName()] as HandoffData;
  const caches = {
    indexes: {},
    phrases: {},
  };

  const initialStore: Record<string, PolyglotWithStaticLocale> =
    Object.fromEntries(
      await Promise.all(
        getRouteNamespaces(__remixRouteModules).map(async (namespace) =>
          initiatePolyglot(
            handoffData.locale,
            namespace,
            options.polyglotOptions,
            await load(namespace, options, handoffData, caches),
          ),
        ),
      ),
    );

  const initialPreload: string[] = [];
  document.querySelectorAll(`[data-i18n-preload]`).forEach(($el) => {
    initialPreload.push($el.getAttribute('href')!);
  });

  return function RemixPolyglotProvider({ children }) {
    const [store, updateStore] = useState(initialStore);
    const [locale, setLocale] = useState<string>(handoffData.locale);
    const loadPhrases = useCallback(
      async (namespace: string | string[], nextLocale: string = locale) => {
        const more = Object.fromEntries(
          await Promise.all(
            (Array.isArray(namespace) ? namespace : [namespace]).map(
              async (ns) =>
                initiatePolyglot(
                  nextLocale,
                  ns,
                  options.polyglotOptions,
                  await load(
                    ns,
                    options,
                    { ...handoffData, locale: nextLocale },
                    caches,
                  ),
                ),
            ),
          ),
        );

        updateStore((current) => ({ ...current, ...more }));
      },
      [locale],
    );
    const _patched = useMemo(() => Symbol('🙈'), []);
    const ctx = useMemo(
      (): RemixPolyglotContextType => ({
        loadPhrases,
        store,
        _patched,
        locale,
        setLocale,
        initialPreload,
        getLocaleFromUrl: options.getLocaleFromUrl,
        routeNamespaces: handoffData.routeNamespaces,
      }),
      [loadPhrases, store, locale, _patched],
    );

    return (
      <RemixPolyglotContext.Provider value={ctx}>
        {children}
      </RemixPolyglotContext.Provider>
    );
  };
}

export function Handoff() {
  const { clientRoutes } = useRemixEntryContext();
  const {
    loadPhrases,
    routeNamespaces,
    _patched,
    initialPreload,
    getLocaleFromUrl,
  } = useRemixPolyglotContext();
  useEffect(() => {
    const patch = (route: ClientRoute) => {
      const originalLoader = route.loader;
      if (originalLoader && !(originalLoader as any)[_patched]) {
        route.loader = async (args) => {
          const locale =
            typeof getLocaleFromUrl === 'function'
              ? getLocaleFromUrl(args.url, args.params)
              : undefined;
          const ns = routeNamespaces[route.id];
          return (
            await Promise.all([
              originalLoader(args),
              ns && loadPhrases(ns, locale),
            ])
          )[0];
        };
        (route.loader as any)[_patched] = 1;
      }
      route.children?.forEach(patch);
    };
    clientRoutes.forEach(patch);
  }, [clientRoutes, routeNamespaces, loadPhrases, _patched, getLocaleFromUrl]);

  return (
    <>
      {initialPreload.map((href) => (
        <link
          key={href}
          rel="prefetch"
          data-i18n-preload
          as="json"
          href={href}
        />
      ))}
    </>
  );
}

export function usePolyglot(namespace: string = 'common') {
  const { store, locale } = useRemixPolyglotContext();
  const id = `${locale}-${namespace}`;

  if (!store[id]) {
    throw new Error(`Unknown namespace ${namespace} in ${locale}`);
  }
  return store[id];
}

export function useLocale(): [string, Dispatch<SetStateAction<string>>] {
  const ctx = useRemixPolyglotContext();
  return [ctx.locale, ctx.setLocale];
}

function useRemixPolyglotContext() {
  const ctx = useContext(RemixPolyglotContext);
  if (!ctx) {
    throw new Error(
      'Must useRemixPolyglotContext inside component returned from setup',
    );
  }
  return ctx;
}

async function load(
  namespace: string,
  { fetch = window.fetch, manifest }: Pick<SetupOptions, 'fetch' | 'manifest'>,
  { locale, baseUrl }: HandoffData,
  { phrases, indexes }: Caches,
): Promise<Record<string, any>> {
  const id = `${locale}-${namespace}`;
  if (phrases[id]) {
    return phrases[id]!;
  }
  if (!manifest[locale]) {
    throw new Error(`Missing index for ${locale}`);
  }

  if (!indexes[locale]) {
    indexes[locale] = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`${baseUrl}/${locale}/${manifest[locale]}`);
        if (String(res.status)[0] !== '2') {
          throw new Error('Failed to load');
        }
        const index = await res.json();
        if (!isRecordOfStrings(index)) {
          throw new Error('Invalid format');
        }
        resolve(index);
      } catch (err) {
        reject(
          new Error(
            `Could not read index for ${locale}. Reason: ${
              err instanceof Error ? err.message : String(err)
            }`,
          ),
        );
      }
    });
  }

  const index = await indexes[locale]!;
  if (!index[namespace]) {
    throw new Error(`Missing namespace ${namespace} on locale ${locale}`);
  }

  phrases[id] = new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`${baseUrl}/${locale}/${index[namespace]}`);
      if (String(res.status)[0] !== '2') {
        throw new Error('Failed to load phrases');
      }
      const resource = await res.json();
      if (!isRecord(resource)) {
        throw new Error('Invalid format');
      }
      resolve(resource);
    } catch (err) {
      reject(
        new Error(
          `Failed to load phrases of namespace ${namespace} in ${locale}. Reason: ${
            err instanceof Error ? err.message : String(err)
          }`,
        ),
      );
    }
  });

  return phrases[id]!;
}
