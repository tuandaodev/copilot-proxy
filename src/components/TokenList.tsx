import { removeToken, tokenList } from '@/models/token/token-item';
import type { TokenItem } from '@/models/token/types';
import type { Component } from 'solid-js';
import { For } from 'solid-js';

const onClickDelete = (item: TokenItem) => {
  if (window.confirm(`Are you sure to delete the token ${item.name}?`)) {
    removeToken(item.id);
  }
};

const TokenList: Component = () => {
  return (
    <For each={tokenList()}>
      {(item) => (
        <div class="flex gap-4 border rounded-lg border-zinc-600 p-4 mb-4 text-sm">
          <div class="flex-1">
            <p class="mb-2">
              <span class="text-blue-500 mr-4">{item.name}</span>
              <span class="text-zinc-400">{item.token}</span>
            </p>
            <p class="text-zinc-500 text-xs">
              Created at: {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
          <div
            class="rounded-sm bg-neutral-800 text-xs px-3 py-1 border border-zinc-600 text-red-400 h-fit hover:bg-red-500 hover:text-zinc-100 hover:border-red-500 font-bold cursor-pointer transition-colors duration-200"
            onClick={() => onClickDelete(item)}
            onKeyPress={() => onClickDelete(item)}
          >
            Delete
          </div>
        </div>
      )}
    </For>
  );
};

export default TokenList;
