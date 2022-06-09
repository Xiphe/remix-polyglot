import type { ComponentType, Dispatch, ReactNode, SetStateAction } from 'react';
import type { EntryContext } from '@remix-run/node';
import type {
  RouteWithValidI18nHandle,
  AllowedPolyglotOptions,
  HandoffData,
} from './common';
import { getGlobalName, isValidKey } from './common';
import { resolve } from 'node:path';
import jsesc from 'jsesc';
import { createContext, useContext, createElement, Fragment } from 'react';
import {
  getRouteNamespaces,
  hasValidI18nHandle,
  isRecord,
  isRecordOfStrings,
} from './common';
import Polyglot from 'node-polyglot';

export type { I18nHandle } from './common';

interface SetupOptions {
  manifest?: string | Record<string, string>;
  localesBaseDir?: string;
  localesBaseUrl?: string;
  key?: string;
  polyglotOptions?:
    | AllowedPolyglotOptions
    | Promise<AllowedPolyglotOptions>
    | ((
        locale: string,
        namespace: string,
      ) => AllowedPolyglotOptions | Promise<AllowedPolyglotOptions>);
}
interface Context {
  locale: string;
  key?: string;
  localesBaseUrl: string;
  store: Record<string, Polyglot>;
  prefetch: string[];
  manifest: Record<string, string>;
  routeNamespaces: Record<string, string | string[]>;
}

const RemixPolyglotContext = createContext<Context | undefined>(undefined);

export async function setup(
  locale: string,
  context: EntryContext,
  {
    key,
    manifest: manifestOpt = resolve('app/manifest-remix-polyglot.json'),
    localesBaseDir = resolve('public/build/locales'),
    localesBaseUrl = '/build/locales',
    polyglotOptions,
  }: SetupOptions = {},
): Promise<ComponentType<{ children?: ReactNode }>> {
  if (!isValidKey(key)) {
    throw new Error(`Invalid key`);
  }
  const matchedRoutIds = context.matches.map(({ route }) => route.id);
  const matchedRouteModules = Object.fromEntries(
    Object.entries(context.routeModules).filter(([id]) =>
      matchedRoutIds.includes(id),
    ),
  );
  const prefetch = new Set<string>();
  const manifest =
    typeof manifestOpt === 'string'
      ? (await import(manifestOpt, { assert: { type: 'json' } })).default
      : manifestOpt;

  if (!isRecordOfStrings(manifest)) {
    throw new Error('Invalid manifest format');
  }
  if (!manifest[locale]) {
    throw new Error(`Unknown locale ${locale}`);
  }
  const { default: index } = await import(
    resolve(localesBaseDir, locale, manifest[locale]),
    { assert: { type: 'json' } }
  );
  if (!isRecordOfStrings(index)) {
    throw new Error(`Invalid index format for locale ${locale}`);
  }
  prefetch.add(`${locale}/${manifest[locale]}`);
  const store: Record<string, Polyglot> = Object.fromEntries(
    await Promise.all(
      getRouteNamespaces(matchedRouteModules).map(
        async (ns): Promise<[string, Polyglot]> => {
          if (!index[ns]) {
            throw new Error(`Unknown namespace ${ns} in ${locale}`);
          }
          const { default: phrases } = await import(
            resolve(localesBaseDir, locale, index[ns]),
            { assert: { type: 'json' } }
          );
          if (!isRecord(phrases)) {
            throw new Error(
              `Invalid phrases format for namespace ${ns} in ${locale}`,
            );
          }
          const options = await (typeof polyglotOptions === 'function'
            ? polyglotOptions(locale, ns)
            : polyglotOptions);
          prefetch.add(`${locale}/${index[ns]}`);
          return [
            ns,
            new Polyglot({
              ...options,
              locale,
              phrases,
            }),
          ];
        },
      ),
    ),
  );

  const routeNamespaces = Object.fromEntries(
    Object.entries(context.routeModules)
      .filter((entry): entry is [string, RouteWithValidI18nHandle] =>
        hasValidI18nHandle(entry[1]),
      )
      .map(([id, { handle }]) => [id, handle.i18n]),
  );

  const ctx: Context = {
    key,
    locale,
    prefetch: Array.from(prefetch),
    manifest,
    localesBaseUrl: localesBaseUrl.replace(/\/$/, ''),
    store,
    routeNamespaces,
  };

  return function RemixPolyglotProvider({ children }) {
    return (
      <RemixPolyglotContext.Provider value={ctx}>
        {children}
      </RemixPolyglotContext.Provider>
    );
  };
}

export function usePolyglot(namespace: string = 'common') {
  const ctx = useRemixPolyglotContext();
  if (!ctx.store[namespace]) {
    throw new Error(`Unknown namespace ${namespace}`);
  }
  return ctx.store[namespace];
}

export function useLocale(): [string, Dispatch<SetStateAction<string>>] {
  const ctx = useRemixPolyglotContext();
  return [
    ctx.locale,
    () => {
      throw new Error('Can not change locale on server');
    },
  ];
}

export function Handoff() {
  const { key, prefetch, manifest, routeNamespaces, localesBaseUrl, locale } =
    useRemixPolyglotContext();

  const handoff: HandoffData = {
    locale,
    baseUrl: localesBaseUrl,
    manifest,
    routeNamespaces,
  };
  return (
    <>
      {prefetch.map((file) => (
        <link
          key={file}
          rel="prefetch"
          data-i18n-preload={key || '_'}
          as="json"
          href={`${localesBaseUrl}/${file}`}
        />
      ))}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.${getGlobalName(key)}=${jsesc(handoff, {
            es6: true,
          })};document.currentScript.remove()`,
        }}
      />
    </>
  );
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
