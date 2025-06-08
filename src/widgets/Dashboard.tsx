import TokenList from '@/components/TokenList';
import TokenResourcePanel from '@/components/TokenResourcePanel';
import { generateToken } from '@/entities/token/model/token-auth';
import type { Component } from 'solid-js';

const Dashboard: Component = () => {
  return (
    <>
      <div class="bg-neutral-950 border-b border-zinc-600 p-4 text-2xl">Copilot Proxy</div>
      <div class="w-full bg-base-100">
        <div class="p-8 w-2xl">
          <p class="flex border-b border-zinc-700 pb-4 mb-4">
            <span class="flex-1 text-xl">Github Copilot device tokens</span>
            <span
              class="rounded-sm bg-neutral-800 text-xs px-3 py-1 border border-zinc-600 hover:bg-neutral-700 cursor-pointer active:bg-neutral-600 transition-colors duration-200"
              onClick={generateToken}
              onKeyPress={generateToken}
            >
              Generate new token
            </span>
          </p>

          <TokenResourcePanel />
          <TokenList />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
