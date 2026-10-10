<template>
  <div v-if="rows.length" class="sm-rows">
    <div v-for="row in rows" :key="row.label" class="sm-row">
      <span class="k">{{ row.label }}</span>
      <span class="v">{{ row.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * 整句话的字段行。
 *
 * 为什么不挤成一行用 · 串起来：读的人得自己在分隔符里找字段名。
 * 每个字段独占一行、标签左对齐成列之后，眼睛能竖着读。
 *
 * 标签用词刻意做视角切换：「她的缺口」是她的处境，「不能碰」与「一句话」
 * 是给你的动作。读的人自然把它们分成两组，不需要额外加小标题。
 */
const props = defineProps<{
  wants: string;
  resist: string;
  weakness: string;
}>();

const rows = computed(() =>
  [
    // 视角切换：第一条说「她」，后两条说「你」。不用小标题也能读分组
    { label: '心愿', value: props.wants },
    { label: '抗拒', value: props.resist },
    { label: '软肋', value: props.weakness },
  ].filter(row => Boolean(row.value)),
);
</script>

<style lang="scss" scoped>
.sm-rows {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 7px;
}

.sm-row {
  display: flex;
  gap: 9px;
  font-size: 12px;
  line-height: 1.55;
}

.k {
  flex: 0 0 58px;
  color: var(--c-text-dim);
  white-space: nowrap;
}

.v {
  flex: 1;
  color: var(--c-text-muted);
}
</style>
