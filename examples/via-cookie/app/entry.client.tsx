import { RemixBrowser } from '@remix-run/react';
import { hydrate } from 'react-dom';
import { setup as setupRemixPolyglot } from 'remix-polyglot/client';
import localeManifest from './manifest-remix-polyglot.json';
import { preloadTranslations } from './util/i18n';

(async function bootstrap() {
  const RemixPolyglotProvider = await setupRemixPolyglot({
    manifest: localeManifest,
    preloadTranslations,
  });

  hydrate(
    <RemixPolyglotProvider>
      <RemixBrowser />
    </RemixPolyglotProvider>,
    document,
  );
})().catch((err) => {
  console.error('Failed to bootstrap client:', err);
});
