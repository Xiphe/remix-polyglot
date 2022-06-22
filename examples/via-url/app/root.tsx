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
import { dirMap } from '~/util/i18n';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export default function App() {
  const locale = useLocale();
  const navigating = useLoadingIndicator();

  return (
    /* 🧑‍🔧 INSTALL: set locale and optionally dir */
    <html lang={locale} dir={dirMap[locale]}>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        {
          /* 🏄 OPTIONAL: not related to this package, just a little loading indicator */
          navigating ? (
            <>
              <br />
              👀 Navigating...
            </>
          ) : null
        }
        <ScrollRestoration />
        {/* 🧑‍🔧 INSTALL: render Handoff before remix Scripts */}
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
