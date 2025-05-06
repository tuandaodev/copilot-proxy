import { addToken } from '@/models/token/token-item';
import type { Component } from 'solid-js';
import { createEffect, createSignal } from 'solid-js';
import type { Accessor } from 'solid-js/types/server/reactive.js';

const TokenAddModal: Component<{ isOpen: Accessor<boolean>; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  let modalRef: HTMLDialogElement | undefined;
  const [nameInput, setNameInput] = createSignal('');
  const [tokenInput, setTokenInput] = createSignal('');

  createEffect(() => {
    if (isOpen()) {
      modalRef.showModal();
    }
  });
  const onClickSave = () => {
    addToken(nameInput(), tokenInput());
    onClickClose();
  };
  const onClickClose = () => {
    if (modalRef) {
      modalRef.close();
      onClose();
    }
  };
  const onKeyDown = (e) => {
    e.key === 'Enter' && onClickSave();
  };
  return (
    <dialog ref={modalRef} class="d-modal">
      <div class="d-modal-box">
        <h3 class="text-lg font-bold">Add new token manually</h3>
        <fieldset class="d-fieldset">
          <legend class="d-fieldset-legend">Name</legend>
          <input
            type="text"
            class="d-input"
            placeholder="Type here"
            value={nameInput()}
            onInput={(e) => setNameInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </fieldset>
        <fieldset class="d-fieldset">
          <legend class="d-fieldset-legend">Token</legend>
          <input
            type="text"
            class="d-input"
            placeholder="Type here"
            value={tokenInput()}
            onInput={(e) => setTokenInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </fieldset>
        <div class="d-modal-action">
          <form method="dialog">
            <button type="button" class="d-btn d-btn-soft d-btn-primary mr-1" onClick={onClickSave}>
              Save
            </button>
            <button type="button" class="d-btn d-btn-ghost" onClick={onClickClose}>
              Cancel
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" class="d-modal-backdrop">
        <button type="button" onClick={onClickClose}>
          Close
        </button>
      </form>
    </dialog>
  );
};

export default TokenAddModal;
