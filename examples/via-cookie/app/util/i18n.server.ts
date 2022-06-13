import type { ActionFunction } from '@remix-run/node';
import type { Submission } from '@remix-run/react/transition';
import { createCookie, redirect } from '@remix-run/node';
import { isSupportedLocale, localeOrFallback } from './i18n';

export const localeCookie = createCookie('locale', {
  maxAge: 31_536_000, // one year
});

export async function getLocaleFromCookie(cookieHeader: string | null) {
  return localeOrFallback(
    ((await localeCookie.parse(cookieHeader)) || {}).locale,
  );
}

/**
 * Decide which translations to load based on LocaleChanger submission
 */
export function preloadTranslations({
  submission,
}: {
  submission?: Submission;
}) {
  if (!submission) {
    return;
  }
  const locale = submission.formData.get('locale')?.toString();
  const action = submission.formData.get('_action')?.toString();
  const namespaces = JSON.parse(
    decodeURIComponent(
      submission.formData.get('namespaces')?.toString() || '[]',
    ),
  );
  if (action === 'switch-lang' && isSupportedLocale(locale)) {
    return { locale, namespaces };
  }

  return undefined;
}

/**
 * Store locale preference for next visit in cookie
 */
export const languageSwitchAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const nextLocale = formData.get('locale')?.toString();
  const redirectTarget = formData.has('_redirect')
    ? decodeURIComponent(formData.get('_redirect')!.toString())
    : '/';
  if (!isSupportedLocale(nextLocale)) {
    throw new Response('Locale not supported', { status: 400 });
  }
  const currentLocale = await getLocaleFromCookie(
    request.headers.get('Cookie'),
  );
  if (currentLocale === nextLocale) {
    return redirect(redirectTarget);
  }

  return redirect(redirectTarget, {
    headers: {
      'Set-Cookie': await localeCookie.serialize({ locale: nextLocale }),
    },
  });
};
