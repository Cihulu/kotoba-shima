# Nihongo Quest — 产品决策与想法记录

> 记录每一个重要的设计选择和背后的理由，方便日后回顾或向 AI 补充上下文。

---

## 技术选型

| 选项 | 决策 | 理由 |
|------|------|------|
| 框架 | Next.js + TypeScript | App Router，方便后续加 API Route |
| 样式 | Tailwind CSS | 快速原型，不需要额外 CSS 文件 |
| 存储 | localStorage | 演示阶段够用，不需要后端 |
| 音效 | Web Audio API（合成） | 无需音频文件，浏览器原生支持 |
| 语音朗读 | Web Speech API（SpeechSynthesis） | 免费，Mac 上 Kyoko 声音质量尚可 |
| 部署 | 暂未部署 | 先把功能做完再说 |

---

## 视觉风格

- **主题**：浅色、简洁、清新——明确拒绝深色主题
- **背景**：`#f5f6fa`，卡片：`#ffffff`，边框：`#e4e7f0`
- **主色调**：Indigo（靛蓝）作为强调色
- **参考**：Dribbble 上的 Eddu 教育平台风格（不照搬，取其卡片布局和配色轻盈感）
- **字体**：Noto Sans JP（Google Fonts，通过 `<link>` 引入，不用 CSS `@import`）

---

## 产品哲学

### 首页设计原则
- **「游乐场式」**：低心理负担，不强迫用户按顺序学
- **成就感优先**：展示"已掌握多少"，而不是"还差多少"
- **启动摩擦最小化**：3 题热身（而非直接进入学习），帮助大脑重新激活记忆
- 热身结束后给两个选项：继续上次 / 返回主页——不替用户做决定

### 多用户设计
- 本地 localStorage，用户间数据隔离
- 用户可以在 Navbar 随时切换，看到各自的学习进度
- 无需登录，演示阶段足够；跨设备同步留到后期加后端时再做

---

## 模块决策

### 五十音图（/gojuuon）
- 表格浏览 + 闯关测验双模式
- 答对的假名 romaji 保存到用户数据，用于热身题池

### 单词闪卡（/flashcards）
- N5 / N4 / N3 分级 + 按类别筛选
- 翻转卡片：正面显示汉字，背面显示读音 + 罗马字 + 释义 + 例句
- 例句可点击朗读
- 自动朗读：切换卡片时朗读单词，翻转时朗读读音

### ~~语法辨义（/grammar）~~
- 已从导航和首页隐藏（文件保留，未删除）
- 原因：功能与解谜重叠，且解谜更有参与感；如有需要可随时加回

### 句子解谜（/puzzle）⭐ 核心创新
- 灵感：比闪卡更有进展感，像侦探一样解读一句话
- 每个 token 两种状态：
  - **有 `question` 字段** → 灰底可点击，需要答题（助词、动词时态等）
  - **无 `question` 字段** → 直接显示词性颜色，不需答题（常见名词、副词等）
- 答对后**不自动关闭**，显示解析 + 「继续」按钮，让用户读完再走
- 答错 → 震动动画 + 错误音效，可重试

### 笔记本（/notebook）
- 合并展示两类笔记，用 Tab 切换：全部 / 生字本 / 语法笔记
- **生字本**：来自单词闪卡，翻牌后点「记录」保存；显示读音、释义、例句
- **语法笔记**：来自句子解谜，答对后点「记笔记」保存；显示词性、题目、解析
- 各用户笔记独立存储于 localStorage

---

## 词性颜色系统

| 词性 | 颜色 |
|------|------|
| 名词 | Indigo（靛蓝） |
| 助词 | Amber（琥珀） |
| 动词 | Rose（玫瑰红） |
| 形容词 | Teal（青绿） |
| 副词 | Purple（紫） |
| 接续词 | Orange（橙） |

---

## 日语断词说明

**当前**：所有 token 全部手动编写，精确控制每个词的粒度和题目。

**未来自动化路径**：
```
NHK 文章 → MeCab / kuromoji.js 自动切词（形态素解析）
         → 每个形态素附带词性、读音、原型
         → Claude API 判断哪些词值得出题
         → 生成 question / options / explanation
```
- `kuromoji.js` 可在浏览器直接运行，无需服务器
- NHK やさしい日本語 每天更新适合外国人阅读的新闻，是理想语料来源

---

## 音频相关

- **音效**：Web Audio API 合成，无需音频文件
  - 答对：C5 → G5 双音（Duolingo 风格）
  - 答错：锯齿波下行 buzz
  - 翻牌：短促 sine click
- **朗读**：Web Speech SpeechSynthesis，声音优先级：Kyoko（Mac 女声）> Otoya（Mac 男声）> Google 日本語 > Windows 声音
- **已知局限**：系统 TTS 音调不够准确，未来可考虑 VOICEVOX（高精度日语 TTS，开源）

---

## 已知 Bug / 历史修复

| 问题 | 原因 | 修复 |
|------|------|------|
| CSS @import 报错 | `@import url(Google Fonts)` 放在 `@import "tailwindcss"` 之后，违反 PostCSS 规则 | 改为在 `layout.tsx` 的 `<head>` 里用 `<link>` 引入 |
| 音效不响 | `AudioContext.resume()` 返回 Promise 未 await，在 suspended 状态下播放 | `getCtx()` 改为 async，加 `await ctx.resume()` |

---

## 未来规划（未实现）

### 近期
- [ ] 接入 Claude API：用户可输入/语音输入对整句的理解，由 AI 判断是否正确并给出个性化反馈
- [ ] 语音输入：Web Speech API `SpeechRecognition`（支持中文 `zh-CN`），在翻译框加麦克风按钮

### 中期
- [ ] NHK やさしい日本語 每日新闻自动抓取（Next.js API Route + 爬虫/RSS）
- [ ] kuromoji.js 自动切词，替代手写 token
- [ ] Claude API 自动生成题目（question / options / explanation）

### 长期
- [ ] 云端后端（用户数据跨设备同步）
- [ ] 多用户社交功能（查看彼此进度）
- [ ] VOICEVOX 集成（高精度日语 TTS，含音调）
- [ ] 根据用户等级动态推荐句子难度
