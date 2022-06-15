import type { Locale } from 'remix-polyglot';
import type { Submission } from '@remix-run/react/transition';
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

/**
 * Decide which translations to load based on LocaleChanger submission
 */
export function preloadTranslations({
  submission,
}: {
  submission?: Submission;
}) {
  if (submission?.formData.get('_action')?.toString() !== 'switch-lang') {
    return undefined;
  }

  const locale = submission.formData.get('locale')?.toString();
  const namespaces = JSON.parse(
    decodeURIComponent(
      submission.formData.get('namespaces')?.toString() || '[]',
    ),
  );
  if (isSupportedLocale(locale)) {
    return { locale, namespaces };
  }

  return undefined;
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
          /* Is there a better way to get the full url from location? */
          [location.pathname, location.search, location.hash].join(''),
        )}
      />
      <button type="submit" name="_action" value="switch-lang">
        {t('switch-lang')}
      </button>
    </Form>
  );
}
