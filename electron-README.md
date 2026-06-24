# CalendarLLM — Electron 桌面版

將 React Native / Expo Web 打包為可在 **Windows** 和 **macOS** 執行的桌面應用程式。

---

## 環境需求

| 工具 | 版本 |
|------|------|
| Node.js | 18 以上 |
| npm | 9 以上 |

---

## 第一步：安裝依賴

```bash
npm install
```

---

## 開發模式（即時熱更新）

同時啟動 Expo Web Dev Server 和 Electron 視窗：

```bash
npm run electron:dev
```

- Expo 會在 `http://localhost:8081` 啟動
- Electron 等 server 就緒後自動開啟視窗
- 修改程式碼後，Electron 視窗會即時更新

---

## 打包為安裝檔

### 打包前先確認

`assets/icon512.png` 必須存在（512×512 PNG，已包含於專案中）。

### Windows（.exe 安裝程式）

在 **Windows** 機器上執行：

```bash
npm run electron:build:win
```

輸出：`electron-dist/CalendarLLM Setup x.x.x.exe`

### macOS（.dmg 安裝檔）

在 **macOS** 機器上執行：

```bash
npm run electron:build:mac
```

輸出：`electron-dist/CalendarLLM-x.x.x.dmg`（含 x64 和 arm64）

### 同時打包 Windows + macOS

> 注意：跨平台打包需要在對應 OS 上執行，或使用 CI（GitHub Actions 等）。

---

## 打包流程說明

```
npm run electron:build:win
  │
  ├─ 1. expo export -p web   → 靜態檔案輸出到 dist/
  └─ 2. electron-builder     → 打包 electron + dist/ → electron-dist/
```

`electron/main.js` 在生產模式下載入 `dist/index.html`；
在開發模式下連接 `http://localhost:8081`。

---

## 專案結構

```
calendarlllm/
├── electron/
│   ├── main.js        ← Electron 主程序
│   └── preload.js     ← 安全橋接腳本
├── src/               ← React Native 元件（不變）
├── assets/            ← 圖示等資源
├── dist/              ← expo export 後產生（勿手動修改）
├── electron-dist/     ← electron-builder 輸出（打包結果）
└── package.json       ← 已包含 electron 設定
```

---

## 常見問題

**Q：`electron:dev` 啟動後 Electron 視窗空白**
A：等待約 10–20 秒讓 Expo 完全啟動。如果還是空白，重新整理視窗（Ctrl+R / Cmd+R）。

**Q：打包後應用程式無法開啟（macOS）**
A：macOS 會阻擋未簽名的應用程式。右鍵點擊 .app → 開啟 → 確認打開。

**Q：Windows 打包需要什麼額外工具？**
A：Windows 打包需要 Visual Studio Build Tools 或 Python。可用以下指令安裝：
```bash
npm install --global windows-build-tools
```

**Q：想修改視窗大小或應用名稱？**
A：編輯 `electron/main.js`（視窗設定）和 `package.json` 的 `"build"` 區塊（應用名稱、圖示等）。
