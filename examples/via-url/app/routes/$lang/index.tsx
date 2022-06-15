import { Link } from '@remix-run/react';
import { usePolyglot } from 'remix-polyglot';

export default function Component() {
  const { tx } = usePolyglot('common');
  return <Link to="deep">{tx('nested')}</Link>;
}
