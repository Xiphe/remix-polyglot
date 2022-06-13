import type { Locale } from 'remix-polyglot';
import { Form, useLocation, useMatches } from '@remix-run/react';
import { getHandleNamespaces, usePolyglot } from 'remix-polyglot';

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

export function LocaleChanger() {
  const { locale, t } = usePolyglot('common');
  const location = useLocation();
  const matches = useMatches();

  return (
    <Form method="post" action="_locale_switch" replace>
      <select name="locale" defaultValue={locale}>
        {supportedLocales.map((locale) => (
          <option key={locale}>{locale}</option>
        ))}
      </select>
      <input
        type="hidden"
        name="namespaces"
        value={encodeURIComponent(
          JSON.stringify(
            getHandleNamespaces(matches.map(({ handle }) => handle)),
          ),
        )}
      />
      <input
        type="hidden"
        name="_redirect"
        value={encodeURIComponent(
          [location.pathname, location.search, location.hash].join(''),
        )}
      />
      <button type="submit" name="_action" value="switch-lang">
        {t('switch-lang')}
      </button>
    </Form>
  );
}
