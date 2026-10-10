# 私拍猎艳 v4 · 状态栏前端界面

SillyTavern 角色卡「私拍猎艳 v4」的状态栏界面构建产物，通过 jsDelivr 供酒馆助手加载。

## 用法

酒馆助手（TavernHelper）会渲染消息楼层里的 HTML 代码块。角色卡的 `状态栏界面` 正则把
`<StatusPlaceHolderImpl/>` 替换成一段加载脚本，指向本仓库的产物：

```
$('body').load('https://testingcf.jsdelivr.net/gh/{USER}/{REPO}/dist/sipai_v4/界面/状态栏/index.html')
```

## 目录

```
dist/sipai_v4/界面/状态栏/index.html   构建产物（CSS/JS 已内联）
```

## 依赖

产物运行时从 jsDelivr 拉取 `vue` 与 `pinia`，并由酒馆助手预注入的全局提供
`Vue` / `$` / `_` / `z`。因此必须在装了酒馆助手的酒馆里使用。

## 源码

源码在本地 `~/tavern_helper_template/src/sipai_v4/`，基于
[tavern_helper_template](https://github.com/StageDog/tavern_helper_template)。
改动后 `pnpm build` 重新生成 `dist/`，推上来即可（jsDelivr 约 12 小时自动刷新缓存，
也可在 https://www.jsdelivr.com/tools/purge 手动刷新）。

## 界面内容

- 五套主题（终端青 / 档案墨纸 / 暗房黑白红 / 玻璃渐变 / 极简细线），右上角按钮切换，选择记在 localStorage
- 频道：手上现金 / 粉丝 / 本月收入 / 订阅
- 追踪中的目标：档位徽章与档位色、堕落值进度条带 20/40/60/80 刻度、事实标签行、「可挖」金色强调、要什么/抗拒/软肋三行、四条路满足度（≥60 加亮）
- 片子库 / 粉丝待办 / 近期
