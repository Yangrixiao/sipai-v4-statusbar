<template>
  <ul class="sm-list">
    <li v-for="(item, index) in items" :key="`${index}-${item}`">{{ item }}</li>
  </ul>
</template>

<script setup lang="ts">
/** 流水类列表：片子库 / 待办 / 近期。 */
defineProps<{
  items: string[];
}>();
</script>

<style lang="scss" scoped>
.sm-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sm-list li {
  position: relative;
  padding: 2px 0 2px 12px;
  color: var(--c-text-muted);
  font-size: 12px;
}

.sm-list li::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--c-text-dim);
}
</style>
