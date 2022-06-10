import type { I18nHandle } from 'remix-polyglot';
import { usePolyglot } from 'remix-polyglot';
import { Link } from '@remix-run/react';

export const handle: I18nHandle = {
  i18n: 'home',
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
