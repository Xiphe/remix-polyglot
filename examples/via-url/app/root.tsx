import type { MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useTransition,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useLocale, Handoff as RemixPolyglotHandoff } from 'remix-polyglot';

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
