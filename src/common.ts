import type {
  EntryRouteModule,
  RouteModules,
} from '@remix-run/server-runtime/routeModules';
import { createElement, Fragment, ReactNode } from 'react';
import type { RouteModules as ReactRouteModules } from '@remix-run/react/routeModules';
import type { PolyglotOptions } from 'node-polyglot';
import Polyglot from 'node-polyglot';

export type AllowedPolyglotOptions = Omit<
  PolyglotOptions,
  'phrases' | 'locale'
>;

export type PolyglotOptionsGetter =
  | AllowedPolyglotOptions
  | Promise<AllowedPolyglotOptions>
  | ((
      locale: string,
      namespace: string,
    ) => AllowedPolyglotOptions | Promise<AllowedPolyglotOptions>);

interface I18nHandle {
  i18n: string | string[];
  [k: string]: unknown;
}

export interface HandoffData {
  baseUrl: string;
  locale: string;
  routeNamespaces: Record<string, undefined | string | string[]>;
}

export interface RmxPolyglot extends Omit<Polyglot, 'locale'> {
  locale: string;
  tx: (
    phrase: string,
    options?: number | Polyglot.InterpolationOptions,
  ) => ReactNode;
}
export async function initiatePolyglot(
  locale: string,
  namespace: string,
  polyglotOptions: PolyglotOptionsGetter | undefined,
  phrases: Record<string, any>,
): Promise<[string, RmxPolyglot]> {
  const options = await (typeof polyglotOptions === 'function'
    ? polyglotOptions(locale, namespace)
    : polyglotOptions);
  const p: RmxPolyglot = new Polyglot({
    ...options,
    locale,
    phrases,
  }) as any;
  p.locale = locale;

  p.tx = p.t.bind({
    ...p,
    replaceImplementation: function replaceReact(
      interpolationRegex: RegExp,
      cb: (a: string, b: string) => string,
    ) {
      // @ts-ignore
      const phrase: string = this;

      if (!phraseCache.has(phrase)) {
        phraseCache.set(
          phrase,
          phrase
            .split(interpolationRegex)
            .map((str, i) =>
              i % 2 === 0
                ? newLinesToBr(str)
                : [
                    `${options?.interpolation?.prefix || '%{'}${str}${
                      options?.interpolation?.suffix || '}'
                    }`,
                    str,
                  ],
            ),
        );
      }

      return createElement(
        Fragment,
        {},
        ...phraseCache
          .get(phrase)!
          .flatMap((nodes, i) =>
            i % 2 === 0 ? nodes : cb(nodes[0] as string, nodes[1] as string),
          ),
      );
    },
  });
  p.t = p.t.bind(p);
  p.extend = p.extend.bind(p);
  p.clear = p.clear.bind(p);
  p.replace = p.replace.bind(p);
  p.has = p.has.bind(p);
  p.unset = p.unset.bind(p);
  return [`${locale}-${namespace}`, p];
}

const phraseCache = new Map<string, (string | ReactNode[])[]>();

function newLinesToBr(st: string): (string | ReactNode)[] {
  return st.split(/\n/).flatMap((st, i, a) => {
    if (i + 1 === a.length) {
      return st;
    }
    return [st, createElement('br')];
  });
}

export function getGlobalName() {
  return `__x_remix_polyglot`;
}

export type RouteWithValidI18nHandle = Omit<EntryRouteModule, 'handle'> & {
  handle: I18nHandle;
};

export function getRouteNamespaces(
  routeModules: RouteModules<EntryRouteModule> | ReactRouteModules,
) {
  return [
    ...new Set(
      Object.values(routeModules)
        .filter(hasValidI18nHandle)
        .flatMap(({ handle: { i18n } }) => i18n),
    ),
  ];
}

export function getHandleNamespaces(handles: unknown[]): string[] {
  return Array.from(
    new Set(handles.filter(isI18nHandle).flatMap(({ i18n }) => i18n)),
  );
}

function isI18nHandle(handle: unknown): handle is I18nHandle {
  if (!isRecord(handle)) {
    return false;
  }

  const i18n = handle.i18n;

  return (
    typeof i18n === 'string' ||
    (Array.isArray(i18n) && i18n.every((ns) => typeof ns === 'string'))
  );
}

export function hasValidI18nHandle(
  route: EntryRouteModule,
): route is RouteWithValidI18nHandle {
  return isI18nHandle(route.handle);
}

export function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
export function isRecordOfStrings(
  input: unknown,
): input is Record<string, string> {
  return (
    isRecord(input) && Object.values(input).every((v) => typeof v === 'string')
  );
}
