import { RemixBrowser } from '@remix-run/react';
import { hydrate } from 'react-dom';
import { setup as setupRemixPolyglot } from 'remix-polyglot/client';
import { preloadTranslations } from '~/util/i18n';
/* ℹ️ this file is created by npm run build:i18n */
import localeManifest from './manifest-remix-polyglot.json';

async function bootstrap() {
  /* 🧑‍🔧 INSTALL: prepare translation context on client
        This makes sure all translation resources required for the first
        render are available */
  const RemixPolyglotProvider = await setupRemixPolyglot({
    manifest: localeManifest,
    preloadTranslations,
  });

  /* ℹ️ SSG/CSR Apps would display a loading spinner/skeleton while setting up
     translations. But Thanks to Remix the page is already fully server rendered
     so we just need to delay the hydration a tiny bit.
     (in practice this should take no time because the required translation
     files are pre-fetched and cached along with all other resources) */

  hydrate(
    /* 🧑‍🔧 INSTALL: make translation context available to our app */
    <RemixPolyglotProvider>
      <RemixBrowser />
    </RemixPolyglotProvider>,
    document,
  );
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap client:', err);
});
