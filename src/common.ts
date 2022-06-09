import type {
  EntryRouteModule,
  RouteModules,
} from '@remix-run/server-runtime/routeModules';
import type { RouteModules as ReactRouteModules } from '@remix-run/react/routeModules';
import type { PolyglotOptions } from 'node-polyglot';

export type AllowedPolyglotOptions = Omit<
  PolyglotOptions,
  'phrases' | 'locale'
>;
export interface I18nHandle {
  i18n: string | string[];
  [k: string]: unknown;
}

export interface HandoffData {
  baseUrl: string;
  locale: string;
  manifest: Record<string, string>;
  routeNamespaces: Record<string, string | string[]>;
}

export function getGlobalName(key?: string) {
  return `__x_remix_polyglot${key ? `_${key}` : ''}`;
}

export function isValidKey(key?: string) {
  return Boolean(!key || key.match(/^[a-z0-9_$]+$/i));
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
