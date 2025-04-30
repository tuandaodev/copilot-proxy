import type { Component } from 'solid-js';
import { Match, Suspense, Switch, createEffect } from 'solid-js';
import TokenList from './TokenList';
import IconCopy from './components/IconCopy';
import { refetchTokenList } from './models/token/token-item';
import { generateToken, tokenResource } from './models/token/token-resource';

const App: Component = () => {
  createEffect(() => {
    if (tokenResource()?.accessToken) {
      refetchTokenList();
    }
  });
  return (
    <>
      <div class="bg-neutral-950 border-b border-zinc-600 p-4 text-2xl">Copilot Proxy</div>
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

        <Suspense fallback={<p class="text-sm">Waiting...</p>}>
          <Switch>
            <Match when={tokenResource()}>
              <p class="text-sm mb-4">{tokenResource().message}</p>
              <p class="text-sm mb-4">
                {tokenResource().verificationUri && tokenResource().deviceCode && (
                  <span>
                    Please visit&nbsp;
                    <a
                      href={tokenResource().verificationUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="underline text-blue-400"
                    >
                      {tokenResource().verificationUri}
                    </a>
                    &nbsp; and paste the code:&nbsp;
                    <span class="font-mono font-bold">{tokenResource().userCode}</span>
                    <IconCopy />
                  </span>
                )}
              </p>
            </Match>
          </Switch>
        </Suspense>
        <TokenList />
      </div>
    </>
  );
};

export default App;
