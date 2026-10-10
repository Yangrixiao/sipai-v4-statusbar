/**
 * 状态栏共享常量与语义映射。
 *
 * 三张表是「数据 → 视觉」的唯一映射点：改了这里，整个界面跟着变。
 */

/** 堕落值五档。每 20 点一档，档位名与「此刻她什么样」都在这里。 */
export const TIERS = [
  { max: 19, name: '生人', note: '客气、有戒备，只谈钱和照片', key: 't0' },
  { max: 39, name: '上手', note: '做过了但公事公办，做完就穿衣', key: 't1' },
  { max: 59, name: '熟了', note: '主动贴上来、自己脱，做完赖着不走', key: 't2' },
  { max: 79, name: '放开', note: '自己开口要，主动问下次什么时候', key: 't3' },
  { max: 100, name: '调教成', note: '听口令，你不在的时候也想着', key: 't4' },
] as const;

/**
 * 四条路。哪一条先补到位，她就往哪条路走。
 * 满足度到了 60 以上，她就肯往下走一步，所以 60 是加亮的临界点。
 */
export const PATHS = [
  { field: '钱', label: '钱', cls: 'p-money' },
  { field: '物', label: '物', cls: 'p-thing' },
  { field: '情', label: '情', cls: 'p-feel' },
  { field: '曝光', label: '曝光', cls: 'p-fame' },
] as const;

/** 满足度加亮的临界点：到她就会答应下一步。 */
export const PATH_HIT_THRESHOLD = 60;

/** 最多并排渲染几个目标，超出的收进「另有 n 人未列」，免得状态栏无限拉长。 */
export const MAX_VISIBLE_TARGETS = 4;

/** 两套主题。只覆盖 CSS 令牌，不改结构。 */
export const THEMES = [
  { id: 'F', name: '暗夜私拍' },
  { id: 'C', name: '暗房红' },
] as const;

export const DEFAULT_THEME = 'F';

/** 主题在消息楼层之间共享，所以存 localStorage 而不是 MVU 变量。 */
export const THEME_STORAGE_KEY = 'sipai_v4:theme';

export type Tier = (typeof TIERS)[number];

/** 按堕落值取档位。超出上限兜到最后一档，负数兜到第一档。 */
export function tierOf(value: unknown): Tier {
  const n = Number(value);
  const v = Number.isFinite(n) ? n : 0;
  return TIERS.find(tier => v <= tier.max) ?? TIERS[TIERS.length - 1];
}

/** 数字兜底：非数字一律当 0，避免界面出现 NaN。 */
export function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** 进度条宽度百分比，夹在 0–100。 */
export function pct(value: unknown): string {
  const v = Math.max(0, Math.min(100, num(value)));
  return `${v}%`;
}
