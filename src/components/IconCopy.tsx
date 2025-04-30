import Copy from 'lucide-solid/icons/copy';
import CopyCheck from 'lucide-solid/icons/copy-check';
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { tokenResource } from '../models/token/token-resource';

const [copied, setCopied] = createSignal(false);
const Icon = () => (copied() ? CopyCheck : Copy);
const tipsCopy = () => (copied() ? 'Copied!' : 'Copy code');
const onClickCopyCode = () => {
  if (tokenResource().userCode) {
    navigator.clipboard.writeText(tokenResource().userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
};

const IconCopy: Component = () => {
  return (
    <div
      class="tooltip tooltip-right inline-block align-middle ml-2 cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 transition-colors duration-200 rounded p-1"
      data-tip={tipsCopy()}
      onClick={onClickCopyCode}
      onKeyPress={onClickCopyCode}
    >
      <Dynamic component={Icon()} size={18} />
    </div>
  );
};

export default IconCopy;
