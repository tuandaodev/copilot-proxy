import IconCopy from '@/components/IconCopy';
import { refetchTokenList } from '@/entities/token/model/token-item';
import { tokenResource } from '@/entities/token/model/token-auth';
import type { Component } from 'solid-js';
import { Match, Suspense, Switch, createEffect } from 'solid-js';

const VerificationInfo: Component = () => {
  return (
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
      <IconCopy tooltips="Copy code" textToCopy={() => tokenResource().userCode} />
    </span>
  );
};

const AccessTokenInfo: Component = () => {
  return (
    <span>
      Keep the token safe. You will not be able to see it again. Your access token is:&nbsp;
      <span class="font-mono font-bold">{tokenResource().accessToken}</span>
      <IconCopy tooltips="Copy access token" textToCopy={() => tokenResource().accessToken} />
    </span>
  );
};

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
            {tokenResource().verificationUri && tokenResource().deviceCode && <VerificationInfo />}
            {tokenResource().accessToken && <AccessTokenInfo />}
          </p>
        </Match>
      </Switch>
    </Suspense>
  );
};

export default TokenResourcePanel;
