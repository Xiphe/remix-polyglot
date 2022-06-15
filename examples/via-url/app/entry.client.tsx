import { RemixBrowser } from '@remix-run/react';
import { hydrate } from 'react-dom';
import { setup as setupRemixPolyglot } from 'remix-polyglot/client';
import { preloadTranslations } from '~/util/i18n';
import localeManifest from './manifest-remix-polyglot.json';

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
