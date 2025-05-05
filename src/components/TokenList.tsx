import { removeToken, setDefaultToken, tokenList } from '@/models/token/token-item';
import type { TokenItem } from '@/models/token/types';
import Bookmark from 'lucide-solid/icons/bookmark';
import BookmarkCheck from 'lucide-solid/icons/bookmark-check';
import Trash from 'lucide-solid/icons/trash-2';
import type { Component } from 'solid-js';
import { For } from 'solid-js';
import QuotaInfo from './QuotaInfo';

const onClickDelete = (item: TokenItem) => {
  if (window.confirm(`Are you sure to delete the token ${item.name}?`)) {
    removeToken(item.id);
  }
};

const onClickDefault = (item: TokenItem) => {
  setDefaultToken(item.id);
};

const TokenList: Component = () => {
  return (
    <ul class="d-list bg-base-100 rounded-box shadow-md">
      <For each={tokenList()}>
        {(item) => (
          <>
            <li class="d-list-row border rounded-lg mb-4 border-zinc-600">
              <div class="d-list-col-grow">
                <div class="flex items-center">
                  <div class="text-blue-500 flex-1">{item.name}</div>
                  <div
                    class="d-tooltip d-tooltip-top cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 transition-colors duration-200 rounded p-1"
                    onClick={() => onClickDefault(item)}
                    onKeyPress={() => onClickDefault(item)}
                    data-tip={item.default ? 'Default' : 'Set as default'}
                  >
                    {item.default ? (
                      <BookmarkCheck size={18} class="text-emerald-400 opacity-60" />
                    ) : (
                      <Bookmark size={18} class="text-zinc-400 opacity-60" />
                    )}
                  </div>
                  <div
                    onClick={() => onClickDelete(item)}
                    onKeyPress={() => onClickDelete(item)}
                    class="d-tooltip d-tooltip-top ml-1 cursor-pointer hover:bg-neutral-700 active:bg-neutral-600 transition-colors duration-200 rounded p-1"
                    data-tip="Delete"
                  >
                    <Trash size={18} class="text-rose-400 opacity-60" />
                  </div>
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
