import type { Component } from 'solid-js';
import { Match, Suspense, Switch, createSignal } from 'solid-js';

interface TokenResource {
  message: string;
  accessToken?: string;
  deviceCode: string;
  userCode: string;
  verificationUri: string;
}

const [tokenResource, setTokenResource] = createSignal<TokenResource>(null);
async function generateToken() {
  const res = await fetch('/admin/token', {
    method: 'POST',
  });
  // const json = await res.json();
  // setToken(json);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const json = JSON.parse(value);
    setTokenResource(json);
    console.log('xxx: generateToken:', json, done);
  }
}

const App: Component = () => {
  return (
    <>
      <div class="bg-neutral-950 border-b border-zinc-600 p-4 text-2xl">Copilot Proxy</div>
      <div class="p-8 w-2xl">
        <p class="flex border-b border-zinc-700 pb-4 mb-4">
          <span class="flex-1 text-xl">Github Copilot device tokens</span>
          <span
            class="rounded-sm bg-neutral-800 text-xs px-3 py-1 border border-zinc-600 hover:bg-neutral-700 cursor-pointer"
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
                  </span>
                )}
              </p>
            </Match>
          </Switch>
        </Suspense>
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
      </div>
    </>
    // <div class="min-h-screen bg-white text-black dark:bg-neutral-900 dark:text-gray-100">
    //   <p class="text-4xl text-green-700 dark:text-green-400 text-center py-20">Hello tailwind</p>
    // </div>
  );
};

export default App;
