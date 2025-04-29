import type { Component } from 'solid-js';

const TokenList: Component = () => {
  return (
    <div class="flex gap-4 border rounded-lg border-zinc-600 p-4 mb-4 text-sm">
      <div class="flex-1">
        <p class="text-zinc-400 mb-2">Tokens</p>
        <p>Never used</p>
      </div>
      <a
        class="rounded-sm bg-neutral-800 text-xs px-3 py-1 border border-zinc-600 text-red-400 h-fit hover:bg-red-500 hover:text-zinc-100 hover:border-red-500 font-bold"
        href="/"
      >
        Delete
      </a>
    </div>
  );
};

export default TokenList;
