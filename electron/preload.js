'use strict';

/**
 * Electron Preload Script
 *
 * 在這裡可以安全地將 Node.js / Electron API 暴露給渲染程序。
 * contextIsolation: true 確保 Web 內容無法直接存取 Node.js。
 *
 * 目前這個 Calendar 應用不需要額外的原生 API，
 * 僅保留基本結構供未來擴充（例如：系統通知、本機檔案存取）。
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 平台資訊（讓 React 元件可以判斷執行環境）
  platform: process.platform,

  // 版本資訊
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },

  // 未來可在這裡加入：
  // - 系統通知：window.electronAPI.notify(title, body)
  // - 開啟本機檔案：window.electronAPI.openFile()
  // - 匯出行事曆：window.electronAPI.exportCalendar(data)
});
