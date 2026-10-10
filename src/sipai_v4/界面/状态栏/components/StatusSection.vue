<template>
  <section class="sm-sec">
    <h3 class="sm-cap">
      <i v-if="icon" class="fa-solid" :class="icon" aria-hidden="true" />
      <span>{{ title }}</span>
    </h3>
    <slot />
  </section>
</template>

<script setup lang="ts">
/** 区块壳子。只负责标题与分隔，内容全由插槽给。 */
defineProps<{
  title: string;
  icon?: string;
}>();
</script>

<style lang="scss" scoped>
.sm-sec {
  padding: 9px 12px;
  border-bottom: 1px solid var(--c-border-soft);
}

.sm-sec:last-child {
  border-bottom: none;
}

.sm-cap {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 0 6px;
  color: var(--c-text-dim);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
}

.sm-cap i {
  opacity: 0.85;
}
</style>
