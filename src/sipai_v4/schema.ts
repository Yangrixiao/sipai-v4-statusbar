// 《私拍猎艳 v4》MVU 变量结构定义（Zod 4）
//
// ── 加载约定 ──
// 本文件由 forge 通过 jiti 在 Node 侧加载，运行时已注入全局 z（Zod 4）与 _（lodash）。
// 顶部禁止任何 import 语句（pack / validate-mvu 会做源码级预检，命中即报错退出），
// 也不要给项目 npm install zod / lodash。
// 同一个 z.object({...}) 内不得出现重复字段键（含嵌套对象与 .prefault({...}) 默认值对象）。
//
// ── 数值口径 ──
// 所有数值都走 z.coerce.number()：'12'、'128.7' 这类纯数字字符串会被转成数再收敛。
// 越界一律用 z.transform + _.clamp 收敛，而不是 .min()/.max() —— 校验失败会让
// 整条变量更新被丢弃，旧值原样保留；宁可把 120 收敛成 100，也不要整条不生效。
// 「堕落值」按需求锁 0–100：给 120 收敛成 100，给 -5 收敛成 0。
// 唯一保留严格语义的是「时段」这类枚举：写法不认识就用 .catch 兜到默认值，
// 不让它污染其它字段的更新。推进节奏与关系亲疏不进变量，由叙事自行把握。
//
// z.coerce 只对 number 用。字符串数组与 boolean 不做 coerce，会被严格拒绝，
// 所以数组做了宽容处理：剔除 null / 数字等非字符串元素（而不是整条报错）。
//
// ── 取值口径（需与 EJS 一致）──
// 世界.当前目标 必须与「目标」表里的花名逐字相同，EJS 用它当键拼 stat_data.目标[<花名>]。
// 当前目标 为空字符串 = 当前没有正在互动的目标（这个约定由「堕落值系统」条目负责描述）。
// 花名、片子编号是动态键，可无限增删，删除用 JSON Patch 的 remove。
// 片子只有「买家」一个字段：买家非空 = 已售，不设 boolean。

export const Schema = z
  .object({
    // ══ 世界 ══
    世界: z
      .object({
        // 游戏内日期，格式 YYYY年MM月DD日，只在过夜或正文明确写到第二天时推进。
        // 用字符串而不是数字：AI 写「2026年10月9日」比维护一个计数器更不容易错。
        日期: z.string().catch('').prefault('2026年10月9日'),

        // 时段决定这一刻能约到谁、哪些场景可用。
        时段: z
          .enum(['早上', '中午', '下午', '傍晚', '晚上', '深夜'])
          .catch('傍晚')
          .prefault('傍晚'),

        // 当前所在地点，供地理条目做 EJS 显隐。
        当前地点: z.string().catch('未明确').prefault('未明确'),

        // 当前正在互动的目标花名，必须已存在于「目标」表中；空字符串表示当前无目标。
        当前目标: z.string().catch('').prefault(''),

        // 当前场景在场的人：可以是目标花名，也可以是工具人职能（如「中介老陈」）。
        // 数组会被 add 追加，所以这里去重；空的、非字符串的元素直接剔除而不是整条报错。
        在场: z
          .array(z.unknown())
          .transform(value =>
            _.uniq(value.filter(item => _.isString(item) && item.trim() !== '')),
          )
          .prefault([]),
      })
      .prefault({}),

    // ══ 主角 ══
    主角: z
      .object({
        // 手上的钱。唯一的经济硬约束，决定今晚能不能订得起房。
        // 每月 1 号的生活费 +2000 由更新规则承担，不设独立字段。
        现金: z.coerce
          .number()
          .transform(value => _.clamp(Math.round(value), 0, 9999999))
          .prefault(2000),

        // 随身器材清单，键为器材名，值为状态描述（如「机身」→「全画幅机身一台，备机一台」）。
        // 买入、损坏、丢失、送人时增删。
        器材: z
          .record(z.string().describe('器材名'), z.string().catch('').prefault(''))
          .prefault({}),

        // 订阅制频道是全卡唯一的事业进度条，EJS 靠 粉丝量 与各档订阅做增长分档。
        频道: z
          .object({
            粉丝量: z.coerce
              .number()
              .transform(value => _.clamp(Math.round(value), 0, 9999999))
              .prefault(0),

            基础订阅: z.coerce
              .number()
              .transform(value => _.clamp(Math.round(value), 0, 9999999))
              .prefault(0),

            高级订阅: z.coerce
              .number()
              .transform(value => _.clamp(Math.round(value), 0, 9999999))
              .prefault(0),

            点单订阅: z.coerce
              .number()
              .transform(value => _.clamp(Math.round(value), 0, 9999999))
              .prefault(0),

            // 本月订阅费与定制单收入合计，换月结算时清零重算。
            月入: z.coerce
              .number()
              .transform(value => _.clamp(Math.round(value), 0, 9999999))
              .prefault(0),

            // 待处理的粉丝互动：点单、催片、投票。元素格式「点单 · 阿伦 · 要她穿护士服」。
            // 处理完一条就 remove 掉；同样的去重与剔除规则同「在场」。
            待办: z
              .array(z.unknown())
              .transform(value =>
                _.uniq(value.filter(item => _.isString(item) && item.trim() !== '')),
              )
              .prefault([]),
          })
          .prefault({}),
      })
      .prefault({}),

    // ══ 目标（★ 动态键值表，花名为键，可无限增删）══
    目标: z
      .record(
        z.string().describe('目标花名'),
        z
          .object({
            // ── 档案：她是谁 ──
            档案: z
              .object({
                年龄: z.coerce
                  .number()
                  .transform(value => _.clamp(Math.round(value), 0, 99))
                  .prefault(0),

                // 具体到干什么：大二在读、商场三楼专柜导购、机关单位文员、小主播。
                身份: z.string().catch('未明确').prefault('未明确'),

                // 她处境里的一句话画像：第二重身份 + 正经程度锚点。
                // 由原「次身份」与「身份锚点」合并而来，用来解释初始堕落值、用来写戏，不参与判定。
                // 例：已婚，家教严，从没拍过 / 在校生，爱玩，朋友圈发过性感图。
                背景: z.string().catch('').prefault(''),
              })
              .prefault({}),

            // ── 欲望：她要什么 ──
            欲望: z
              .object({
                // 她最缺什么、最想要什么。自由文本，一句话写清，不贴标签。
                // 例：欠着八千花呗，催款的天天打电话 / 想换手机又舍不得。
                心愿: z.string().catch('未明确').prefault('未明确'),
              })
              .prefault({}),

            // ── 开发：她在床上与镜头前被开发到哪一步 ──
            开发: z
              .object({
                // 0–100，每 20 点一档。档位名由 EJS 推，不另存。
                // 给 120 收敛成 100、给 -5 收敛成 0，避免整条更新被丢弃。
                堕落值: z.coerce
                  .number()
                  .transform(value => _.clamp(Math.round(value), 0, 100))
                  .prefault(0),

                // 她现在的底线，要能逐字引用她的原话（「不要露脸。就到这儿」）。
                抗拒: z.string().catch('未明确').prefault('未明确'),

                // 一句能打中她的话或一个能打中她的动作。
                软肋: z.string().catch('未明确').prefault('未明确'),

                // 她出事会从哪出。一个人只给一个主要翻车点，别堆。
                翻车点: z.string().catch('未明确').prefault('未明确'),
              })
              .prefault({}),

            // ── 供给：你给没给到她想要的（原「满足度」拍平一层）──
            供给: z
              .object({
                钱: z.coerce
                  .number()
                  .transform(value => _.clamp(Math.round(value), 0, 100))
                  .prefault(0),
                物: z.coerce
                  .number()
                  .transform(value => _.clamp(Math.round(value), 0, 100))
                  .prefault(0),
                情: z.coerce
                  .number()
                  .transform(value => _.clamp(Math.round(value), 0, 100))
                  .prefault(0),
                曝光: z.coerce
                  .number()
                  .transform(value => _.clamp(Math.round(value), 0, 100))
                  .prefault(0),
              })
              .prefault({}),

            // ── 产出：拍了什么 ──
            产出: z
              .object({
                // 拍成的片数，中断或素材作废的不计数。
                片数: z.coerce
                  .number()
                  .transform(value => _.clamp(Math.round(value), 0, 9999))
                  .prefault(0),

                // 已经拍过的主题，元素取「拍摄主题」条目里的主题名，用于查重与排期。
                主题: z
                  .array(z.unknown())
                  .transform(value =>
                    _.uniq(value.filter(item => _.isString(item) && item.trim() !== '')),
                  )
                  .prefault([]),
              })
              .prefault({}),

            // ── 来路：她从哪来、身边有谁 ──
            来路: z
              .object({
                // 自己找的 / 回头客带的 / 中介给的，或具体介绍人花名。
                介绍人: z.string().catch('未明确').prefault('未明确'),

                // 一两个能挖的闺蜜或同事：元素格式「阿珊 · 同寝室 · 关系一般」。
                身边的人: z
                  .array(z.unknown())
                  .transform(value =>
                    _.uniq(value.filter(item => _.isString(item) && item.trim() !== '')),
                  )
                  .prefault([]),
              })
              .prefault({}),
          })
          .prefault({}),
      )
      .prefault({}),

    // ══ 片子（动态键值，片子编号或片名为键）══
    片子: z
      .record(
        z.string().describe('片子编号或片名'),
        z
          .object({
            // 出镜的目标与用的主题都写在编号里（「日期 · 目标 · 主题」），
            // 这里只留买家，避免同一件事存在两处、两边对不上。
            // 买家非空 = 已售；没卖出去就是空字符串，买家只记号不记实名。
            买家: z.string().catch('').prefault(''),
          })
          .prefault({}),
      )
      .prefault({}),

    // ══ 记录（最多 5 条，超出丢最早的）══
    // 元素格式「日期 · 做了什么 · 结果」，日期照抄当时的「世界.日期」。
    // 剔除空的与非字符串的元素，再只留最近 5 条（takeRight 保证新记录进得来）。
    记录: z
      .array(z.unknown())
      .transform(value =>
        _.takeRight(
          _.uniq(value.filter(item => _.isString(item) && item.trim() !== '')),
          5,
        ),
      )
      .prefault([]),
  })
  .prefault({});

export type Schema = z.output<typeof Schema>;
