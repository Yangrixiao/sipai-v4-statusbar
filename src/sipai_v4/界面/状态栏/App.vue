<template>
  <div class="sm-root" :data-theme="theme">
    <div class="sm-card">
      <StatusHeader
        v-model:theme="theme"
        :date="world.日期 || '—'"
        :period="world.时段 || '—'"
        :place="world.当前地点 || '—'"
        :rec="Boolean(world.当前目标)"
        :all-open="allOpen"
        @update:all-open="setAllOpen"
      />

      <!-- 资源区：钱决定你能做什么，属于顶层状态，所以放在目标之前 -->
      <StatusSection title="频道" icon="fa-tower-broadcast">
        <MetricStrip
          :cash="player.现金"
          :fans="channel.粉丝量"
          :income="channel.月入"
          :sub-basic="channel.基础订阅"
          :sub-pro="channel.高级订阅"
          :sub-order="channel.点单订阅"
        />
      </StatusSection>

      <StatusSection title="追踪中的目标" icon="fa-fire">
        <template v-if="targetNames.length">
          <TargetCard
            v-for="name in shownTargets"
            :key="name"
            :name="name"
            :target="targets[name] ?? {}"
            :open="allOpen"
            :version="version"
          />
          <p v-if="hiddenCount > 0" class="more">另有 {{ hiddenCount }} 人未列</p>
        </template>
        <EmptyHint v-else>手上还没有人。去放单群发帖、私信，或者等人介绍。</EmptyHint>
      </StatusSection>

      <StatusSection :title="filmTitle" icon="fa-film">
        <ItemList v-if="filmLines.length" :items="filmLines" />
        <EmptyHint v-else>还没有片。第一组卖出去之前，一分钱都进不来。</EmptyHint>
      </StatusSection>

      <StatusSection title="粉丝那边等你处理的" icon="fa-bell">
        <ItemList v-if="todos.length" :items="todos" />
        <EmptyHint v-else>没有待办。</EmptyHint>
      </StatusSection>

      <StatusSection title="近期" icon="fa-clock-rotate-left">
        <ItemList v-if="recent.length" :items="recent.slice(-5)" />
        <EmptyHint v-else>还没有记录。</EmptyHint>
        <p v-if="present.length" class="present">此刻在场：{{ present.join('、') }}</p>
      </StatusSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { DEFAULT_THEME, MAX_VISIBLE_TARGETS, THEMES, THEME_STORAGE_KEY } from './util/constants';
import EmptyHint from './components/EmptyHint.vue';
import ItemList from './components/ItemList.vue';
import MetricStrip from './components/MetricStrip.vue';
import StatusHeader from './components/StatusHeader.vue';
import StatusSection from './components/StatusSection.vue';
import TargetCard from './components/TargetCard.vue';
import { useDataStore } from './store';

const store = useDataStore();

const world = computed<Record<string, any>>(() => store.data.世界 ?? {});
const player = computed<Record<string, any>>(() => store.data.主角 ?? {});
const channel = computed<Record<string, any>>(() => player.value.频道 ?? {});
const targets = computed<Record<string, Record<string, any>>>(() => store.data.目标 ?? {});
const films = computed<Record<string, Record<string, any>>>(() => store.data.片子 ?? {});

const targetNames = computed(() => Object.keys(targets.value));

/** 每个目标的当前堕落值（在 开发.堕落值 里），供排序用。 */
function fallOf(name: string): number {
  return Number(targets.value[name]?.开发?.堕落值 ?? 0);
}

/**
 * 目标多了会把状态栏拉成一屏半，所以超过上限就只列堕落值最高的几个。
 * 排序是为了让「最该动的那个」永远在最上面。
 */
const shownTargets = computed(() => {
  const names = targetNames.value;
  if (names.length <= MAX_VISIBLE_TARGETS) return names;
  return [...names].sort((a, b) => fallOf(b) - fallOf(a)).slice(0, MAX_VISIBLE_TARGETS);
});

const hiddenCount = computed(() => Math.max(0, targetNames.value.length - MAX_VISIBLE_TARGETS));

const present = computed<string[]>(() =>
  Array.isArray(world.value.在场) ? world.value.在场.filter(Boolean) : [],
);
const todos = computed<string[]>(() =>
  Array.isArray(channel.value.待办) ? channel.value.待办.filter(Boolean) : [],
);
const recent = computed<string[]>(() =>
  Array.isArray(store.data.记录) ? store.data.记录.filter(Boolean) : [],
);

/**
 * 片子编号本身已经写成「日期 · 目标 · 主题」，所以后面只补状态，不重复主题。
 * 片子只有「买家」一个字段：买家非空 = 已售。
 */
const filmLines = computed(() =>
  Object.entries(films.value).map(([key, film]) =>
    film?.买家 ? `${key}　已售 → ${film.买家}` : `${key}　待售`,
  ),
);

const filmTitle = computed(() => {
  const total = Object.keys(films.value).length;
  const sold = Object.values(films.value).filter(film => film?.买家).length;
  return `片子 · ${total} 组（待售 ${total - sold} / 已售 ${sold}）`;
});

// ── 主题：存 localStorage，楼层之间共享 ──
const theme = ref(DEFAULT_THEME);

function isValidTheme(value: unknown): value is string {
  return THEMES.some(item => item.id === value);
}

try {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (isValidTheme(saved)) theme.value = saved;
} catch {
  /* localStorage 不可用时用默认主题 */
}

watch(theme, value => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    /* 存不了也不影响本次显示 */
  }
});

/**
 * 「全部展开／收起」用一个版本号广播，而不是把 open 直接下发给每张卡。
 * 直接下发会让单张卡关不上——父级的值一直是 true 就把它压回去了。
 * 版本号只在点按钮时递增，卡片 watch 到变化才同步，平时各管各的。
 */
const allOpen = ref(false);
const version = ref(0);

function setAllOpen(value: boolean) {
  allOpen.value = value;
  version.value += 1;
}
</script>

<style lang="scss" scoped>
.sm-card {
  overflow: hidden;
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  background: var(--c-surface);
}

.present {
  margin: 6px 0 0;
  color: var(--c-text-dim);
  font-size: 12px;
}

.more {
  margin: 8px 0 0;
  color: var(--c-text-dim);
  font-size: 11px;
  text-align: center;
}
</style>
