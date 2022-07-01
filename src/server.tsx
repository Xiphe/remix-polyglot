import { ComponentType, ReactNode } from 'react';
import type { EntryContext } from '@remix-run/node';
import type {
  RouteWithValidI18nHandle,
  PolyglotOptionsGetter,
  HandoffData,
  RmxPolyglot,
} from './common';
import { createContext, useContext, createElement, Fragment } from 'react';
import { resolve } from 'node:path';
import jsesc from 'jsesc';
import {
  initiatePolyglot,
  getGlobalName,
  getRouteNamespaces,
  hasValidI18nHandle,
  isRecord,
  isRecordOfStrings,
} from './common';

export type { RmxPolyglot } from './common';
export { getHandleNamespaces } from './common';

interface SetupOptions {
  locale: string;
  remixContext: EntryContext;
  manifest: Record<string, string>;
  localesBaseDir?: string;
  localesBaseUrl?: string;
  polyglotOptions?: PolyglotOptionsGetter;
}

interface Context {
  locale: string;
  localesBaseUrl: string;
  store: Record<string, RmxPolyglot>;
  prefetch: string[];
  manifest: Record<string, string>;
  routeNamespaces: Record<string, string | string[]>;
}

export const RemixPolyglotContext = createContext<Context | undefined>(
  undefined,
);

export async function setup({
  locale,
  remixContext,
  manifest,
  localesBaseDir = resolve('public/build/locales'),
  localesBaseUrl = '/build/locales',
  polyglotOptions,
}: SetupOptions): Promise<ComponentType<{ children?: ReactNode }>> {
  const matchedRoutIds = remixContext.matches.map(({ route }) => route.id);
  const matchedRouteModules = Object.fromEntries(
    Object.entries(remixContext.routeModules).filter(([id]) =>
      matchedRoutIds.includes(id),
    ),
  );
  const prefetch = new Set<string>();

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
  const store: Record<string, RmxPolyglot> = Object.fromEntries(
    await Promise.all(
      getRouteNamespaces(matchedRouteModules).map(
        async (ns): Promise<[string, RmxPolyglot]> => {
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

          prefetch.add(`${locale}/${index[ns]}`);
          return initiatePolyglot(locale, ns, polyglotOptions, phrases);
        },
      ),
    ),
  );

  const routeNamespaces = Object.fromEntries(
    Object.entries(remixContext.routeModules)
      .filter((entry): entry is [string, RouteWithValidI18nHandle] =>
        hasValidI18nHandle(entry[1]),
      )
      .map(([id, { handle }]) => [id, handle.i18n]),
  );

  const ctx: Context = {
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
  const { store, locale } = useRemixPolyglotContext();
  const id = `${locale}-${namespace}`;

  if (!store[id]) {
    throw new Error(`Unknown namespace ${namespace}`);
  }
  return store[id];
}

export function useLocale(): string {
  const ctx = useRemixPolyglotContext();
  return ctx.locale;
}

export function Handoff() {
  const { prefetch, routeNamespaces, localesBaseUrl, locale } =
    useRemixPolyglotContext();

  const handoff: HandoffData = {
    locale,
    baseUrl: localesBaseUrl,
    routeNamespaces,
  };
  return (
    <>
      {prefetch.map((file) => (
        <link
          key={file}
          rel="prefetch"
          data-i18n-preload
          as="json"
          href={`${localesBaseUrl}/${file}`}
        />
      ))}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.${getGlobalName()}=${jsesc(handoff, {
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
