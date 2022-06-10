import type { MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useMatches,
  useTransition,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useLocale, Handoff as RemixPolyglotHandoff } from 'remix-polyglot';
import { isSupportedLocale } from './util/i18n';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export default function App() {
  const locale = useLocale();
  const navigating = useLoadingIndicator();

  return (
    <html lang={locale} dir="ltr">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        {navigating ? (
          <>
            <br />
            👀 Navigating...
          </>
        ) : null}
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
