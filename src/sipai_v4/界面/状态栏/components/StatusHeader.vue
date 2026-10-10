<template>
  <header class="sm-head">
    <span class="rec" :class="{ 'is-on': rec }">
      <i class="fa-solid fa-circle" aria-hidden="true" />
      REC
    </span>
    <span class="when">{{ date }} · {{ period }}</span>
    <span class="where">
      <i class="fa-solid fa-location-dot" aria-hidden="true" />
      {{ place }}
    </span>
    <button
      type="button"
      class="sm-expand"
      :title="allOpen ? '全部收起' : '全部展开'"
      :aria-expanded="allOpen"
      @click="emit('update:allOpen', !allOpen)"
    >
      <i class="fa-solid" :class="allOpen ? 'fa-compress' : 'fa-expand'" aria-hidden="true" />
    </button>
    <ThemeSwitcher v-model="theme" />
  </header>
</template>

<script setup lang="ts">
import ThemeSwitcher from './ThemeSwitcher.vue';

defineProps<{
  date: string;
  period: string;
  place: string;
  /** 有目标正在互动时亮红点，像取景器里的录制指示 */
  rec: boolean;
  allOpen: boolean;
}>();

const emit = defineEmits<{ 'update:allOpen': [boolean] }>();

const theme = defineModel<string>('theme', { required: true });
</script>

<style lang="scss" scoped>
.sm-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface-alt);
  flex-wrap: wrap;
}

/* 取景框的四角刻线 */
.sm-head::before,
.sm-head::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1px solid var(--c-accent);
  opacity: 0.55;
  pointer-events: none;
}

.sm-head::before {
  top: 4px;
  left: 4px;
  border-right: none;
  border-bottom: none;
}

.sm-head::after {
  right: 4px;
  bottom: 4px;
  border-left: none;
  border-top: none;
}

/* REC：常暗，有目标在场时点亮并呼吸 */
.rec {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--c-text-dim);
  font-size: 10px;
  letter-spacing: 0.12em;
  font-family: var(--font-num, monospace);
}

.rec i {
  font-size: 6px;
}

.rec.is-on {
  color: var(--c-rec);
}

.rec.is-on i {
  animation: rec-blink 1.6s ease-in-out infinite;
}

@keyframes rec-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

.when {
  color: var(--c-text-muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.where {
  margin-left: auto;
  color: var(--c-text-muted);
  font-size: 12px;
}

.where i {
  margin-right: 3px;
  opacity: 0.75;
}

.sm-expand {
  padding: 2px 7px;
  border: 1px solid var(--c-border);
  border-radius: var(--r-inner, 3px);
  background: none;
  color: var(--c-text-muted);
  font-size: 10px;
  cursor: pointer;
}

.sm-expand:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
}
</style>
