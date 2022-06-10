import { Link } from '@remix-run/react';
import { usePolyglot } from 'remix-polyglot';

export default function Component() {
  const { t } = usePolyglot('common');
  return <Link to="deep">{t('nested')}</Link>;
}
