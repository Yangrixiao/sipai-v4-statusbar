<template>
  <div class="sm-needs">
    <span v-for="path in meters" :key="path.label" class="p" :class="path.cls">
      <span class="nk">{{ path.label }}</span>
      <span class="track"><i class="fill" :style="{ width: path.width }" /></span>
      <span class="num" :class="{ hit: path.hit }">{{ path.value }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PATH_HIT_THRESHOLD, PATHS, num, pct } from '../util/constants';

/**
 * 四条路满足度。
 *
 * 一眼要看出「哪一条快破了」——谁会先跟你走。
 * 所以每条各一色，到临界点（60）时数值加亮加粗。
 */
const props = defineProps<{
  values: Record<string, unknown>;
}>();

const meters = computed(() =>
  PATHS.map(path => {
    const value = num(props.values?.[path.field]);
    return {
      label: path.label,
      cls: path.cls,
      value,
      width: pct(value),
      hit: value >= PATH_HIT_THRESHOLD,
    };
  }),
);
</script>

<style lang="scss" scoped>
.sm-needs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 7px;
  color: var(--c-text-dim);
  font-size: 11px;
}

.p {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.track {
  display: inline-block;
  overflow: hidden;
  width: 46px;
  height: 5px;
  border-radius: 3px;
  background: var(--c-track);
}

.fill {
  display: block;
  height: 100%;
  transition: width 0.4s ease;
}

.num {
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}

/* 到临界点：她下一步就会答应 */
.num.hit {
  color: var(--c-accent);
  font-weight: 800;
}

.p-money .fill {
  background: var(--c-path-money);
}

.p-thing .fill {
  background: var(--c-path-thing);
}

.p-feel .fill {
  background: var(--c-path-feel);
}

.p-fame .fill {
  background: var(--c-path-fame);
}
</style>
