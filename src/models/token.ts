import { createSignal } from 'solid-js';

interface TokenResource {
  message: string;
  accessToken?: string;
  deviceCode: string;
  userCode: string;
  verificationUri: string;
}

const [tokenResource, setTokenResource] = createSignal<TokenResource>(null);
export { tokenResource };
export async function generateToken() {
  const res = await fetch('/admin/token', {
    method: 'POST',
  });
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const json = JSON.parse(value);
    setTokenResource(json);
  }
}
