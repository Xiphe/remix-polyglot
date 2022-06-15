import type { MetaFunction } from '@remix-run/node';
import type { I18nHandle } from 'remix-polyglot';
import { useState, useEffect } from 'react';
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useTransition,
} from '@remix-run/react';
import { Handoff as RemixPolyglotHandoff, usePolyglot } from 'remix-polyglot';
import { dirMap, LocaleChanger } from '~/util/i18n';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export const handle: I18nHandle = {
  i18n: 'common',
};

export default function App() {
  const { locale, t } = usePolyglot('common');
  const navigating = useLoadingIndicator();

  return (
    <html lang={locale} dir={dirMap[locale]}>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>{t('greeting')}</h1>
        <LocaleChanger />
        <Outlet />
        {
          /* This is optional.
             I use it when testing to ensure remix considers navigation done when i18n is ready */
          navigating ? (
            <>
              <br />
              👀 Navigating...
            </>
          ) : null
        }
        <ScrollRestoration />
        <RemixPolyglotHandoff />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function useLoadingIndicator() {
  const { state } = useTransition();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (state === 'idle') {
      setLoading(false);
      return;
    }
    const i = setTimeout(() => {
      setLoading(true);
    }, 300);
    return () => clearTimeout(i);
  }, [state]);

  return loading;
}
