<template>
  <div class="sm-strip">
    <div v-for="cell in cells" :key="cell.label" class="sm-metric" :class="cell.cls">
      <span class="k">{{ cell.label }}</span>
      <span class="v">{{ cell.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { num } from '../util/constants';

/**
 * 频道 —— 「我有什么」。
 * 放在目标之前，因为钱决定你能做什么，是顶层状态而不是目标的一部分。
 */
const props = defineProps<{
  cash: unknown;
  fans: unknown;
  income: unknown;
  subBasic: unknown;
  subPro: unknown;
  subOrder: unknown;
}>();

const cells = computed(() => [
  { label: '手上现金', value: num(props.cash), cls: 'is-money' },
  { label: '粉丝', value: num(props.fans), cls: 'is-channel' },
  { label: '本月收入', value: num(props.income), cls: 'is-money' },
  {
    label: '订阅 基础 / 高级 / 点单',
    value: `${num(props.subBasic)} / ${num(props.subPro)} / ${num(props.subOrder)}`,
    cls: '',
  },
]);
</script>

<style lang="scss" scoped>
.sm-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: 8px;
}

.sm-metric {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 9px;
  border: 1px solid var(--c-border-soft);
  border-radius: var(--r-inner);
  background: var(--c-surface-alt);
}

.k {
  color: var(--c-text-dim);
  font-size: 11px;
}

.v {
  color: var(--c-text);
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.is-money .v {
  color: var(--c-money);
}

.is-channel .v {
  color: var(--c-channel);
}
</style>
