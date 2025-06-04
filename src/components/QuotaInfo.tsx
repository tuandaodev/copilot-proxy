import type { TokenItem } from '@/models/token/types';
import Refresh from 'lucide-solid/icons/rotate-ccw';
import type { Component } from 'solid-js';

type QuotaInfoProps = {
  item: TokenItem;
  onClickRefresh?: () => void;
};

const DEFAULT_CHAT_QUOTA = 500;
const DEFAULT_COMPLETIONS_QUOTA = 4000;

function calcUsageRate(quota: number, defaultQuota: number) {
  return Math.floor(100 - (quota / defaultQuota) * 100);
}

function getProgressStyle(usageRate: number): string {
  return usageRate < 80 ? 'info' : usageRate < 90 ? 'warning' : 'error';
}

function formatResetTime(time: number) {
  if (!time) return 'N/A';
  return new Date(time).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const QuotaInfo: Component<QuotaInfoProps> = (props) => {
  const {
    chatQuota = DEFAULT_CHAT_QUOTA,
    completionsQuota = DEFAULT_COMPLETIONS_QUOTA,
    resetTime,
  } = props.item.meta || {};
  const chatUsageRate = calcUsageRate(chatQuota, DEFAULT_CHAT_QUOTA);
  const completionsUsageRate = calcUsageRate(completionsQuota, DEFAULT_COMPLETIONS_QUOTA);
  return (
    <div class="w-60 text-zinc-400">
      <div class="font-bold flex mb-1 items-center">
        <span class="flex-1">Copilot Free Plan Usage</span>
        <Refresh
          class="cursor-pointer hover:text-zinc-300"
          onClick={() => props.onClickRefresh?.()}
          size={12}
        />
      </div>
      <div class="flex">
        <span class="flex-1">Chat messages</span>
        <span
          class="d-tooltip d-tooltip-right"
          data-tip={`${DEFAULT_CHAT_QUOTA - chatQuota} / ${DEFAULT_CHAT_QUOTA}`}
        >
          {chatUsageRate}%
        </span>
      </div>
      <progress
        class={`d-progress d-progress-${getProgressStyle(chatUsageRate)} block mt-1 mb-2 h-[5px]`}
        value={chatUsageRate}
        max="100"
      />
      <div class="flex">
        <span class="flex-1">Code completions</span>
        <span
          class="d-tooltip d-tooltip-right"
          data-tip={`${DEFAULT_COMPLETIONS_QUOTA - completionsQuota} / ${DEFAULT_COMPLETIONS_QUOTA}`}
        >
          {completionsUsageRate}%
        </span>
      </div>
      <progress
        class={`d-progress d-progress-${getProgressStyle(completionsUsageRate)} block mt-1 mb-2 h-[5px]`}
        value={completionsUsageRate}
        max="100"
      />
      <div>Limits will reset on {formatResetTime(resetTime)}.</div>
    </div>
  );
};

export default QuotaInfo;
