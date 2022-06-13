import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { setup as setupRemixPolyglot } from 'remix-polyglot';
import { getLocaleFromCookie } from '~/util/i18n.server';
import localeManifest from './manifest-remix-polyglot.json';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const locale = await getLocaleFromCookie(request.headers.get('Cookie'));
  const RemixPolyglotProvider = await setupRemixPolyglot({
    locale,
    remixContext,
    manifest: localeManifest,
  });

  let markup = renderToString(
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
