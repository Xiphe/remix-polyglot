import type { I18nHandle } from 'remix-polyglot';
import { usePolyglot } from 'remix-polyglot';
import { Link } from '@remix-run/react';

/* 🗣 USE: to be safe, let's declare all used namespaces
   even though common is already loaded by parent */
export const handle: I18nHandle = {
  i18n: ['home', 'common'],
};

export default function Component() {
  const { locale, t } = usePolyglot('home');
  const { t: tc } = usePolyglot('common');
  return (
    <>
      <h1>{t('title')}</h1>
      <Link to={`/${locale}`}>{tc('back')}</Link>
    </>
  );
}
