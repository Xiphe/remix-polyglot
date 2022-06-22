import type { Locale } from 'remix-polyglot';

export const supportedLocales: Locale[] = ['en', 'es'];
export const dirMap: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr',
};

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

/**
 * ℹ️ Called in client side navigation.
 *
 * Helps remix-polyglot to load required translation
 * files before rendering the new route so that we do
 * not see a flash of untranslated content in case
 * the target url is in a different locale
 */
export function preloadTranslations({ url }: { url: URL }) {
  return { locale: getLocaleFromPathname(url.pathname) };
}
