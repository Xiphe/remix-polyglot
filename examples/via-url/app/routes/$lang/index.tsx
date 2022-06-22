import { Link } from '@remix-run/react';
import { usePolyglot } from 'remix-polyglot';

/* 🗣 USE: nested-routes may not re-declare namespaces
   that have been declared by parents */

export default function Component() {
  /* 🗣 USE: t returns string and accepts strings and numbers in interpolation
     (the default polyglot behavior) */
  const { t } = usePolyglot('common');
  return <Link to="deep">{t('nested')}</Link>;
}
