'use strict';

const { app, BrowserWindow, Menu, shell, dialog, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

// 必須在 app ready 之前宣告自訂 protocol
// 讓 Expo 匯出的 index.html 裡的絕對路徑（如 /_expo/... /assets/...）能正確解析
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { secure: true, standard: true, supportFetchAPI: true, allowServiceWorkers: true },
  },
]);

// 判斷是開發模式還是打包後的生產模式
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 390,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !isDev, // 開發時允許 localhost 跨域
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'CalendarLLM',
    // macOS 隱藏標題列，讓 UI 更原生
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#4A90D9',
    show: false, // 先隱藏，等內容載入再顯示（避免白閃）
  });

  // 內容載入完成後再顯示視窗
  win.once('ready-to-show', () => {
    win.show();
  });

  if (isDev) {
    // 開發模式：連接 Expo web dev server
    win.loadURL('http://localhost:8081');
    win.webContents.openDevTools();
  } else {
    // 生產模式：透過自訂 app:// 協議載入，解決絕對路徑問題
    // 使用 app://localhost/index.html 確保 pathname 為 /index.html 而非 /
    win.loadURL('app://localhost/index.html').catch((err) => {
      dialog.showErrorBox(
        '載入失敗',
        `無法載入應用程式：\n${err.message}\n\n請確認 dist/ 資料夾存在。`
      );
    });
  }

  // 外部連結在預設瀏覽器中打開
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  return win;
}

function buildMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS App Menu
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about', label: '關於 CalendarLLM' },
              { type: 'separator' },
              { role: 'services', label: '服務' },
              { type: 'separator' },
              { role: 'hide', label: '隱藏 CalendarLLM' },
              { role: 'hideOthers', label: '隱藏其他' },
              { role: 'unhide', label: '顯示全部' },
              { type: 'separator' },
              { role: 'quit', label: '退出 CalendarLLM' },
            ],
          },
        ]
      : []),
    {
      label: '編輯',
      submenu: [
        { role: 'undo', label: '復原' },
        { role: 'redo', label: '取消復原' },
        { type: 'separator' },
        { role: 'cut', label: '剪下' },
        { role: 'copy', label: '複製' },
        { role: 'paste', label: '貼上' },
        { role: 'selectAll', label: '全選' },
      ],
    },
    {
      label: '檢視',
      submenu: [
        { role: 'reload', label: '重新載入' },
        { role: 'forceReload', label: '強制重新載入' },
        ...(isDev ? [{ role: 'toggleDevTools', label: '開發者工具' }] : []),
        { type: 'separator' },
        { role: 'resetZoom', label: '實際大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '縮小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全螢幕' },
      ],
    },
    {
      label: '視窗',
      submenu: [
        { role: 'minimize', label: '縮到最小' },
        { role: 'zoom', label: '縮放' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front', label: '全部移至前方' },
            ]
          : [{ role: 'close', label: '關閉' }]),
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  // 註冊 app:// 協議，將所有請求對應到 dist/ 資料夾
  // 解決 Expo export 產生的絕對路徑（/_expo/... /assets/...）在 file:// 下無法載入的問題
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    // url.pathname 例如 /index.html、/_expo/static/js/...
    const filePath = path.join(__dirname, '../dist', url.pathname);
    // 用 pathToFileURL 正確處理 Windows 路徑（C:\... → file:///C:/...）
    return net.fetch(pathToFileURL(filePath).toString());
  });

  buildMenu();
  createWindow();

  // macOS：點 Dock 圖示時重開視窗
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Windows / Linux：所有視窗關閉時退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
