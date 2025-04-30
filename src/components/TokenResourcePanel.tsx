import IconCopy from '@/components/IconCopy';
import { refetchTokenList } from '@/models/token/token-item';
import { tokenResource } from '@/models/token/token-resource';
import type { Component } from 'solid-js';
import { Match, Suspense, Switch, createEffect } from 'solid-js';

const TokenResourcePanel: Component = () => {
  createEffect(() => {
    if (tokenResource()?.accessToken) {
      refetchTokenList();
    }
  });
  return (
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
  );
};

export default TokenResourcePanel;
