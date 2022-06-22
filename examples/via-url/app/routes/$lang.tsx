import type { I18nHandle } from 'remix-polyglot';
import { usePolyglot } from 'remix-polyglot';
import { Link, Outlet, useLocation } from '@remix-run/react';

/* 🗣 USE: routes must declare all namespaces used
   by the route itself and its components
   (nested routes declare their own namespaces) */
export const handle: I18nHandle = {
  i18n: 'common',
};

export default function Component() {
  /* 🗣 USE: tx returns react fragments and accepts nodes in interpolation
    (based WIP: https://github.com/airbnb/polyglot.js/pull/171) */
  const { locale, tx } = usePolyglot('common');
  /* 🏄 Optional: super lazy language switcher that works because we only have
     two locales in this example */
  const loc = useLocation();
  const langSwitch = {
    ...loc,
    pathname: [
      locale === 'en' ? '/es' : '/en',
      ...loc.pathname.split('/').slice(2),
    ].join('/'),
  };

  return (
    <>
      {/* 🚂 Play: Try misspelling "greeting" or "name" to see type checking */}
      <h1>{tx('greeting', { name: <em>Human</em> })}</h1>
      <Link to={langSwitch}>{tx('switch-lang')}</Link>
      <br />
      <Outlet />
    </>
  );
}
