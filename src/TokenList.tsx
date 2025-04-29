import type { Component } from 'solid-js';
import { For } from 'solid-js';
import { tokenList } from './models/token/token-item';

const TokenList: Component = () => {
  return (
    <For each={tokenList()}>
      {(token) => (
        <div class="flex gap-4 border rounded-lg border-zinc-600 p-4 mb-4 text-sm">
          <div class="flex-1">
            <p class="text-blue-500 mb-2">{token.name}</p>
            <p class="text-zinc-500 text-xs">
              Created at: {new Date(token.createdAt).toLocaleString()}
            </p>
          </div>
          <a
            class="rounded-sm bg-neutral-800 text-xs px-3 py-1 border border-zinc-600 text-red-400 h-fit hover:bg-red-500 hover:text-zinc-100 hover:border-red-500 font-bold"
            href="/"
          >
            Delete
          </a>
        </div>
      )}
    </For>
  );
};

export default TokenList;
