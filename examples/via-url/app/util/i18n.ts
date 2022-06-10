import type { Locale } from 'remix-polyglot';

export const supportedLocales: Locale[] = ['en', 'es'];

export function isSupportedLocale(maybeLocale?: string): maybeLocale is Locale {
  return (
    maybeLocale !== undefined &&
    (supportedLocales as string[]).includes(maybeLocale)
  );
}

export function localeOrFallback(maybeLocale: string): Locale {
  return isSupportedLocale(maybeLocale) ? maybeLocale : supportedLocales[0];
}

export function getLocaleFromPathname(pathname: string) {
  return localeOrFallback(pathname.split('/')[1]);
}

export function preloadTranslations({ url }: { url: URL }) {
  return { locale: getLocaleFromPathname(url.pathname) };
}
