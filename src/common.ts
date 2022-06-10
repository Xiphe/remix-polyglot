import type {
  EntryRouteModule,
  RouteModules,
} from '@remix-run/server-runtime/routeModules';
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
  routeNamespaces: Record<string, string | string[]>;
}

export interface PolyglotWithStaticLocale extends Omit<Polyglot, 'locale'> {
  locale: string;
}
export async function initiatePolyglot(
  locale: string,
  namespace: string,
  polyglotOptions: PolyglotOptionsGetter | undefined,
  phrases: Record<string, any>,
): Promise<[string, PolyglotWithStaticLocale]> {
  const options = await (typeof polyglotOptions === 'function'
    ? polyglotOptions(locale, namespace)
    : polyglotOptions);
  const p: PolyglotWithStaticLocale = new Polyglot({
    ...options,
    locale,
    phrases,
  }) as any;
  p.locale = locale;
  p.t = p.t.bind(p);
  p.extend = p.extend.bind(p);
  p.clear = p.clear.bind(p);
  p.replace = p.replace.bind(p);
  p.has = p.has.bind(p);
  p.unset = p.unset.bind(p);
  return [`${locale}-${namespace}`, p];
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

export function hasValidI18nHandle(
  route: EntryRouteModule,
): route is RouteWithValidI18nHandle {
  const i18n = route.handle?.i18n;

  return (
    typeof i18n === 'string' ||
    (Array.isArray(i18n) && i18n.every((ns) => typeof ns === 'string'))
  );
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
