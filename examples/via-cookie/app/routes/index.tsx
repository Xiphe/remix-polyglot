import type { I18nHandle } from 'remix-polyglot';
import { Link } from '@remix-run/react';
import { usePolyglot } from 'remix-polyglot';

export const handle: I18nHandle = {
  i18n: 'common',
};

export default function Component() {
  const { t } = usePolyglot('common');
  return <Link to="deep">{t('nested')}</Link>;
}
