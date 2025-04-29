import { createResource } from 'solid-js';
import type { TokenItem } from './types';

async function fetchTokenResource() {
  const res = await fetch('/admin/tokens', {
    method: 'GET',
  });
  return res.json();
}

const [tokenList] = createResource<TokenItem[]>(fetchTokenResource);

export { tokenList };
