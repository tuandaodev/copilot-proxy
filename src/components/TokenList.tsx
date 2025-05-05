import { removeToken, setDefaultToken, tokenList } from '@/models/token/token-item';
import type { TokenItem } from '@/models/token/types';
import Bookmark from 'lucide-solid/icons/bookmark';
import BookmarkCheck from 'lucide-solid/icons/bookmark-check';
import Pencil from 'lucide-solid/icons/pencil';
import Trash from 'lucide-solid/icons/trash-2';
import type { Component } from 'solid-js';
import { For, createSignal } from 'solid-js';
import QuotaInfo from './QuotaInfo';
import TokenEditModal from './TokenEditModal';

const onClickDelete = (item: TokenItem) => {
  if (window.confirm(`Are you sure to delete the token ${item.name}?`)) {
    removeToken(item.id);
  }
};

const onClickDefault = (item: TokenItem) => {
  setDefaultToken(item.id);
};

type MenuItemProps = {
  children?: any;
  tooltip: string;
  onClick: any;
};

const MenuItem: Component<MenuItemProps> = (props: MenuItemProps) => {
  return (
    <div
      class="d-tooltip d-tooltip-top ml-1 cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 transition-colors duration-200 rounded p-1"
      onClick={props.onClick}
      onKeyPress={props.onClick}
      data-tip={props.tooltip}
    >
      <span class="opacity-60 text-zinc-400">{props.children}</span>
    </div>
  );
};

const TokenList: Component = () => {
  const [editingItem, setEditingItem] = createSignal(null);

  const showModal = (item: TokenItem) => {
    setEditingItem(item);
  };

  return (
    <ul class="d-list bg-base-100 rounded-box shadow-md">
      <TokenEditModal editingItem={editingItem} onClose={() => setEditingItem(null)} />
      <For each={tokenList()}>
        {(item) => (
          <>
            <li class="d-list-row border rounded-lg mb-4 border-zinc-600">
              <div class="d-list-col-grow">
                <div class="flex items-center">
                  <div class="text-blue-500 flex-1">{item.name}</div>
                  <MenuItem onClick={() => showModal(item)} tooltip="Edit">
                    <Pencil size={18} />
                  </MenuItem>
                  <MenuItem
                    onClick={() => onClickDefault(item)}
                    tooltip={item.default ? 'Default token' : 'Set as default'}
                  >
                    {item.default ? (
                      <BookmarkCheck size={18} class="text-emerald-400" />
                    ) : (
                      <Bookmark size={18} />
                    )}
                  </MenuItem>
                  <MenuItem onClick={() => onClickDelete(item)} tooltip="Delete">
                    <Trash size={18} class="text-rose-400" />
                  </MenuItem>
                </div>
                <div class="text-zinc-400">{item.token}</div>
                <div class="text-zinc-500 text-xs my-2">
                  Created at: {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <QuotaInfo item={item} />
            </li>
          </>
        )}
      </For>
    </ul>
  );
};

export default TokenList;
