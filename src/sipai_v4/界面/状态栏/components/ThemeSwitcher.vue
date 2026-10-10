<template>
  <div class="sm-theme">
    <button type="button" class="sm-theme-btn" :aria-expanded="open" @click="open = !open">
      {{ model }}
    </button>
    <ul v-if="open" class="sm-theme-menu">
      <li
        v-for="theme in THEMES"
        :key="theme.id"
        class="sm-theme-item"
        :class="{ 'is-on': theme.id === model }"
        @click="pick(theme.id)"
      >
        <span class="key">{{ theme.id }}</span>
        <span class="name">{{ theme.name }}</span>
        <span class="tick">{{ theme.id === model ? '✓' : '' }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref } from 'vue';
import { THEMES } from '../util/constants';

/** 主题在楼层之间共享，所以由 App 统一持有，这里只负责选。 */
const model = defineModel<string>({ required: true });

const open = ref(false);
const box = ref<HTMLElement | null>(null);

onClickOutside(box, () => {
  open.value = false;
});

function pick(id: string) {
  model.value = id;
  open.value = false;
}
</script>

<style lang="scss" scoped>
.sm-theme {
  position: relative;
}

.sm-theme-btn {
  padding: 2px 8px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-inner, 3px);
  background: none;
  color: var(--c-text-muted);
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  user-select: none;
}

.sm-theme-btn:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
}

.sm-theme-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  z-index: 20;
  min-width: 136px;
  margin: 0;
  padding: 3px;
  list-style: none;
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  background: var(--c-surface);
  box-shadow: 0 8px 24px rgb(0 0 0 / 45%);
}

.sm-theme-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 7px;
  border-radius: 4px;
  color: var(--c-text-muted);
  font-size: 11px;
  cursor: pointer;
  user-select: none;
}

.sm-theme-item:hover {
  background: var(--c-surface-alt);
  color: var(--c-text);
}

.sm-theme-item.is-on {
  color: var(--c-accent);
  font-weight: 700;
}

.key {
  width: 10px;
  color: var(--c-text-dim);
  font-weight: 800;
}

.sm-theme-item.is-on .key {
  color: var(--c-accent);
}

.name {
  flex: 1;
}

.tick {
  width: 9px;
}
</style>
