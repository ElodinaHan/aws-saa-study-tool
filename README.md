<div align="center">

# AWS SAA Tracker

**Demo: [saa.elodinahan.com](https://saa.elodinahan.com)** (supports bilingual switching / 支持中英雙語切換)

---

An immersive, open-source study platform for the AWS Solutions Architect Associate (SAA-C03) exam.

沉浸式 AWS Solutions Architect Associate (SAA-C03) 學習平台 — 極簡、無干擾的開源學習工具。

> **For English version, please scroll down to the [English](#english) section.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ElodinaHan/aws-saa-study-tool/pulls)

[English](#english) | [繁體中文](#繁體中文)

</div>

---

## 繁體中文

### 功能亮點

| 模塊 | 描述 |
| --- | --- |
| **知識庫 (Knowledge Hub)** | 64 個核心 AWS 概念，按 4 大考試領域分類，卡片式瀏覽，展開即見重點 |
| **閃卡複習 (Flashcards)** | 沉浸式全屏翻轉卡片，支持鍵盤操作（← → 翻頁，空格翻轉），進入心流狀態 |
| **模擬測驗 (Quizzes)** | 從知識庫隨機生成 10-30 題選擇題，即時批改，附正確答案與錯誤解析 |
| **進度儀表板 (Dashboard)** | 環形進度圖 + GitHub 風格熱力圖，一眼掌握學習狀態 |
| **全局搜索 (Cmd+K)** | 快速搜索任意 AWS 概念（支持英文 / 中文模糊匹配） |
| **概念標注** | 選中文字即可高亮/加粗/馬克筆標色，快捷鍵 N 打開備忘錄 |
| **筆記面板** | 側邊欄統一查看所有概念筆記，方便隨時回顧 |
| **本地數據 (Local-first)** | 零後端，所有進度自動保存在瀏覽器 localStorage，支持 JSON 導出/導入備份 |
| **暗色/亮色主題** | 深邃午夜藍暗色主題 + 清爽亮色模式，一鍵切換 |

### 設計理念

- **極簡主義** — 無廣告、無多餘裝飾，如美術館般的呼吸感留白
- **亮色默認** — 清爽亮色模式為默認，暗色模式一鍵切換可用
- **微動效反饋** — 打勾時的紙屑散開效果、脈衝環動畫、卡片翻轉 3D 過渡
- **零摩擦體驗** — 可摺疊側邊欄 + 鍵盤快捷鍵，讓你專注於學習本身

### 考試領域覆蓋

| 領域 | 佔比 | 概念數 |
| --- | --- | --- |
| Domain 1: 安全架構設計 | 30% | 26 |
| Domain 2: 高可用架構設計 | 26% | 14 |
| Domain 3: 高性能架構設計 | 24% | 18 |
| Domain 4: 成本優化架構設計 | 20% | 6 |
| Cross-cutting Services | — | 4 |

### 快速開始

```bash
# 克隆倉庫
git clone https://github.com/ElodinaHan/aws-saa-study-tool.git
cd aws-saa-study-tool

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

打開瀏覽器訪問 `http://localhost:5173`

### 構建部署

```bash
# 生產構建
npm run build

# 預覽構建結果
npm run preview
```

構建產物在 `dist/` 目錄中，為純靜態文件，可直接部署到：
- **GitHub Pages** — 推薦，開箱即用
- **Vercel / Netlify** — 連接 GitHub 自動部署
- **S3 + CloudFront** — 用 AWS 自身服務部署

### 項目結構

```
aws-saa-study-tool/
├── index.html                  # 入口 HTML
├── vite.config.js              # Vite 配置
├── package.json
├── src/
│   ├── main.jsx                # React 入口
│   ├── App.jsx                 # 路由 + 側邊欄佈局
│   ├── i18n.jsx                # 國際化語言系統
│   ├── data/
│   │   └── domains.js          # 64 個 AWS 概念知識庫數據
│   ├── hooks/
│   │   └── useStorage.js       # localStorage 持久化 + 主題 + 導入導出
│   ├── components/
│   │   ├── TopicCard.jsx       # 概念卡片（含標注、備忘錄、微動效）
│   │   ├── ProgressRing.jsx    # SVG 環形進度圖
│   │   └── CommandPalette.jsx  # Cmd+K 全局搜索面板
│   ├── pages/
│   │   ├── Hub.jsx             # 知識庫主頁
│   │   ├── Flashcards.jsx      # 閃卡複習頁
│   │   ├── Quiz.jsx            # 模擬測驗頁
│   │   └── Settings.jsx        # 設定 + 進度儀表板 + 數據備份
│   └── styles/
│       └── index.css           # 全局 CSS 變量 + 暗/亮主題 + 動畫
└── AWS-SAA-C03-Knowledge-Base.jsx  # 原始知識庫（保留）
```

### 快捷鍵

| 快捷鍵 | 功能 |
| --- | --- |
| `Cmd+K` / `Ctrl+K` | 打開全局搜索 |
| `N` | 打開/關閉當前展開卡片的備忘錄 |
| `ESC` | 關閉彈窗 / 退出閃卡模式 |
| `←` `→` | 閃卡模式：上/下一張 |
| `Space` | 閃卡模式：翻轉卡片 |

### 隱私聲明

本工具 **完全在瀏覽器端運行**，不收集任何用戶數據，不發送任何網絡請求（除了加載 Google Fonts 字體）。你的學習進度僅保存在本地 `localStorage` 中。

---

## English

### Features

- **Knowledge Hub** — 64 core AWS concepts organized by 4 exam domains with expandable detail cards
- **Flashcards** — Immersive full-screen card flip review with keyboard navigation (arrow keys to navigate, Space to flip)
- **Quiz Generator** — Randomly generated multiple-choice quizzes (10-30 questions) with instant grading, correct answers and explanations
- **Progress Dashboard** — Ring chart + GitHub-style heatmap to visualize mastery status
- **Global Search (Cmd+K)** — Instant search across all concepts (English & Chinese)
- **Concept Annotations** — Select text to highlight/bold/color-mark; press N to open memo
- **Notes Panel** — Sidebar panel to view all concept notes in one place
- **Local-first** — Zero backend; all progress persists in browser localStorage with JSON export/import
- **Dark/Light Theme** — Clean light mode by default; deep midnight-blue dark theme available

### Quick Start

```bash
git clone https://github.com/ElodinaHan/aws-saa-study-tool.git
cd aws-saa-study-tool
npm install
npm run dev
```

### Tech Stack

| Technology | Purpose |
| --- | --- |
| [React 18](https://react.dev) | UI framework |
| [Vite 6](https://vitejs.dev) | Build tool & dev server |
| [React Router 6](https://reactrouter.com) | Client-side routing |
| CSS Custom Properties | Theming (dark/light) |
| localStorage | Data persistence |

### Contributing

Contributions are welcome! Feel free to:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built by [ElodinaHan](https://elodinahan.com) for AWS certification learners**

If this tool helps your exam preparation, please give it a Star!

如果這個工具對你的備考有幫助，歡迎給個 Star!

</div>
