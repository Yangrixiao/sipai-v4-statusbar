<template>
  <article class="sm-target" :class="tier.key">
    <header class="head" @click="expanded = !expanded">
      <span class="name">{{ name }}</span>
      <span class="badge">{{ tier.name }}</span>
      <span class="note">{{ tier.note }}</span>
      <i class="fa-solid fa-chevron-down arrow" :class="{ 'is-open': expanded }" aria-hidden="true" />
    </header>

    <!-- 堕落值：五档色温。颜色在这里替代读数字 -->
    <div class="sm-bar">
      <i class="fill" :style="{ width: pct(value) }" />
      <span class="ticks">
        <i v-for="tick in TICKS" :key="tick" :style="{ left: `${tick}%` }" />
      </span>
    </div>
    <div class="meta">堕落值 {{ num(value) }} / 100</div>

    <FactChips
      :age="profile.年龄"
      :identity="profile.身份 ?? ''"
      :sub-identity="profile.背景 ?? ''"
      :source="whoIntroduced"
      :shot-count="shotCount"
      :themes="themes"
      :around="around"
    />

    <!-- 这三条是玩家的操作说明书，所以进收缩态。藏起来等于逼玩家每看一个人点一次 -->
    <FieldRows :wants="wish" :resist="resist" :weakness="weakness" />

    <!-- 四条路：哪一条先补到位，她就往哪条路走 -->
    <PathMeters :values="supply" />

    <!-- 展开区只补背景与排期资料，不做「展开才看得见重点」 -->
    <div v-if="expanded" class="detail">
      <div class="detail-cap">背景与排期</div>
      <dl class="detail-rows">
        <div v-if="whoIntroduced" class="drow">
          <dt>介绍人</dt>
          <dd>{{ whoIntroduced }}</dd>
        </div>
        <div class="drow">
          <dt>拍过什么</dt>
          <dd>{{ shotText }}</dd>
        </div>
        <div v-if="around.length" class="drow">
          <dt>身边的人</dt>
          <dd>{{ around.join('　') }}</dd>
        </div>
      </dl>
      <p v-if="pitfall" class="alert">翻车点：{{ pitfall }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { num, pct, tierOf } from '../util/constants';
import FactChips from './FactChips.vue';
import FieldRows from './FieldRows.vue';
import PathMeters from './PathMeters.vue';

/** 堕落值刻度：五档的分界，20/40/60/80。 */
const TICKS = [20, 40, 60, 80];

const props = defineProps<{
  name: string;
  target: Record<string, any>;
  /** App 的「全部展开／全部收起」的当前值。 */
  open: boolean;
  /** 每次点「全部展开／收起」递增。只在它变化时同步，平时单张状态不受父级影响。 */
  version: number;
}>();

const expanded = ref(props.open);

watch(
  () => props.version,
  () => {
    expanded.value = props.open;
  },
);

const tier = computed(() => tierOf(props.target?.开发?.堕落值));
const value = computed(() => num(props.target?.开发?.堕落值));
const profile = computed<Record<string, any>>(() => props.target?.档案 ?? {});
const supply = computed<Record<string, unknown>>(() => props.target?.供给 ?? {});

const themes = computed<string[]>(() =>
  Array.isArray(props.target?.产出?.主题) ? props.target.产出.主题.filter(Boolean) : [],
);
const around = computed<string[]>(() =>
  Array.isArray(props.target?.来路?.身边的人) ? props.target.来路.身边的人.filter(Boolean) : [],
);

const shotCount = computed(() => num(props.target?.产出?.片数));
const whoIntroduced = computed<string>(() => props.target?.来路?.介绍人 ?? '');
const wish = computed<string>(() => props.target?.欲望?.心愿 ?? '');
const resist = computed<string>(() => props.target?.开发?.抗拒 ?? '');
const weakness = computed<string>(() => props.target?.开发?.软肋 ?? '');
const pitfall = computed<string>(() => props.target?.开发?.翻车点 ?? '');

const shotText = computed(() => {
  const base = `已拍 ${shotCount.value} 组`;
  return themes.value.length > 0 ? `${base}（${themes.value.join('、')}）` : base;
});
</script>

<style lang="scss" scoped>
.sm-target {
  padding: 10px 12px;
  border: 1px solid var(--c-border-soft);
  border-left: 3px solid var(--c-tier-1);
  border-radius: var(--r-card);
  background: var(--c-surface-alt);
}

.sm-target + .sm-target {
  margin-top: 8px;
}

/* 档位色：名字、徽章、进度条三者同色 */
.sm-target.t0 {
  border-left-color: var(--c-tier-0);
}

.sm-target.t1 {
  border-left-color: var(--c-tier-1);
}

.sm-target.t2 {
  border-left-color: var(--c-tier-2);
}

.sm-target.t3 {
  border-left-color: var(--c-tier-3);
}

.sm-target.t4 {
  border-left-color: var(--c-tier-4);
}

.head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  cursor: pointer;
  user-select: none;
}

.name {
  font-size: 15px;
  font-weight: 700;
}

.t0 .name {
  color: var(--c-tier-0);
}

.t1 .name {
  color: var(--c-tier-1);
}

.t2 .name {
  color: var(--c-tier-2);
}

.t3 .name {
  color: var(--c-tier-3);
}

.t4 .name {
  color: var(--c-tier-4);
}

.badge {
  padding: 1px 7px;
  border: 1px solid currentcolor;
  border-radius: 9px;
  font-size: 11px;
}

.t0 .badge {
  color: var(--c-tier-0);
}

.t1 .badge {
  color: var(--c-tier-1);
}

.t2 .badge {
  color: var(--c-tier-2);
}

.t3 .badge {
  color: var(--c-tier-3);
}

.t4 .badge {
  color: var(--c-tier-4);
}

/* 此刻她什么样：跟档位徽章是同一件事的两种粒度，所以贴着徽章读 */
.note {
  margin-left: auto;
  color: var(--c-text-muted);
  font-size: 12px;
}

.arrow {
  color: var(--c-text-dim);
  font-size: 10px;
  transition: transform 0.25s;
}

.arrow.is-open {
  transform: rotate(180deg);
}

.sm-bar {
  position: relative;
  overflow: hidden;
  height: var(--bar-h);
  margin: 7px 0 3px;
  border-radius: var(--r-inner);
  background: var(--c-track);
}

.fill {
  display: block;
  height: 100%;
  transition: width 0.4s ease;
}

.t0 .fill {
  background: var(--c-tier-0);
}

.t1 .fill {
  background: var(--c-tier-1);
}

.t2 .fill {
  background: var(--c-tier-2);
}

.t3 .fill {
  background: var(--c-tier-3);
}

.t4 .fill {
  background: var(--c-tier-4);
}

.ticks {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ticks i {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--tick-w);
  background: var(--c-tick);
  opacity: var(--tick-opacity);
}

.meta {
  color: var(--c-text-dim);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

/* ── 展开区：只补背景与排期，不做「重点藏在里面」 ── */
.detail {
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px dashed var(--c-border);
}

.detail-cap {
  margin-bottom: 5px;
  color: var(--c-text-dim);
  font-size: 10px;
  letter-spacing: 0.14em;
}

.detail-rows {
  margin: 0;
}

.drow {
  display: flex;
  gap: 9px;
  font-size: 12px;
  line-height: 1.55;
}

.drow + .drow {
  margin-top: 3px;
}

.drow dt {
  flex: 0 0 56px;
  color: var(--c-text-dim);
  white-space: nowrap;
}

.drow dd {
  flex: 1;
  margin: 0;
  color: var(--c-text-muted);
}

/* 全卡唯一需要真的警觉的信息 */
.alert {
  margin: 8px 0 0;
  padding-left: 9px;
  border-left: 3px solid var(--c-danger);
  color: var(--c-danger);
  font-size: 12px;
}
</style>
