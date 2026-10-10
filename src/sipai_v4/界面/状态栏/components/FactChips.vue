<template>
  <div v-if="chips.length" class="sm-tags">
    <span
      v-for="chip in chips"
      :key="chip.text"
      class="sm-tag"
      :class="{ 'is-lead': chip.isLead }"
    >
      {{ chip.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { num } from '../util/constants';

/**
 * 事实标签行。
 *
 * 两条约定：
 * 1. 值本身能自解释就不加前缀（「自己找的」而不是「来源 自己找的」），
 *    前缀只在同一位置可能放不同类别数据时才需要消歧
 * 2. 「可挖」是这一排里唯一「接下来能做什么」的信息，单独一类并排在最后，
 *    否则它会淹没在「19 岁」这种静态事实里
 */
const props = defineProps<{
  age: unknown;
  identity: string;
  subIdentity: string;
  source: string;
  shotCount: unknown;
  themes: string[];
  around: string[];
}>();

interface Chip {
  text: string;
  isLead?: boolean;
}

const chips = computed<Chip[]>(() => {
  const list: Chip[] = [];

  if (num(props.age) > 0) list.push({ text: `${num(props.age)} 岁` });
  if (props.identity) list.push({ text: props.identity });
  if (props.subIdentity) list.push({ text: props.subIdentity });
  if (props.source) list.push({ text: props.source });

  const themes = props.themes.filter(Boolean);
  if (props.shotCount != null || themes.length > 0) {
    const suffix = themes.length > 0 ? `（${themes.join('、')}）` : '';
    list.push({ text: `已拍 ${num(props.shotCount)} 组${suffix}` });
  }

  const around = props.around.filter(Boolean);
  if (around.length > 0) list.push({ text: `可挖 ${around.join('、')}`, isLead: true });

  return list;
});
</script>

<style lang="scss" scoped>
.sm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 7px;
}

.sm-tag {
  padding: 1px 7px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-inner);
  background: var(--c-surface-alt);
  color: var(--c-text-muted);
  font-size: 11px;
  white-space: nowrap;
}

/* 机会线索：跟静态事实不是一类东西，用强调色把它挑出来 */
.sm-tag.is-lead {
  background: none;
  border-color: var(--c-lead);
  color: var(--c-lead);
}
</style>
