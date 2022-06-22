import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { setup as setupRemixPolyglot } from 'remix-polyglot';
import { supportedLocales, getLocaleFromPathname } from '~/util/i18n';
/* ℹ️ this file is created by npm run build:i18n */
import localeManifest from './manifest-remix-polyglot.json';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const { pathname } = new URL(request.url);
  /* 🏄 Optional: redirect to default locale from root
        this could also take accept-language headers into account
        or just use the default locale and render the root page */
  if (pathname === '/') {
    return new Response(null, {
      status: 302,
      headers: {
        location: `/${supportedLocales[0]}`,
        'cache-control': 's-maxage=0,max-age=86400',
      },
    });
  }

  /* ℹ️ Note that you could also use other parts of the url to determine locale */
  const locale = getLocaleFromPathname(pathname);
  /* 🧑‍🔧 INSTALL: prepare translation context on server */
  const RemixPolyglotProvider = await setupRemixPolyglot({
    locale,
    remixContext,
    manifest: localeManifest,
  });

  let markup = renderToString(
    /* 🧑‍🔧 INSTALL: make translation context available to our app */
    <RemixPolyglotProvider>
      <RemixServer context={remixContext} url={request.url} />
    </RemixPolyglotProvider>,
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
