app id: com.calendarlllm.app

src/
├── components/
│   ├── EventForm.js / EventItem.js   # 行事曆事件
│   └── TaskForm.js / TaskItem.js     # 待辦任務
├── context/
│   └── CalendarContext.js            # 全域狀態（events, tasks, currentDate/View）
├── screens/
│   ├── DayView.js / WeekView.js / MonthView.js / YearView.js
│   └── TodoScreen.js
└── utils/
    ├── colors.js / dateUtils.js / storage.js
主要功能

日/週/月/年 四種行事曆視圖切換
行事曆事件（含時間、地點、內容）CRUD
待辦事項（含優先度、完成狀態）CRUD
本地 AsyncStorage 持久化

cd D:\project\ai\ai-project\calendarlllm
npm install expo
npx expo prebuild --platform android


先跑:npx expo start 再按a run on android it will install expo on target phone.
PS D:\project\ai\ai-project\calendarlllm> npx expo start
再按debug


npm run web
npx expo install react-dom react-native-web @expo/metro-runtime
# 或
npx expo start --web

產生金鑰,到Google Play Console註冊這個calendarlllm app id.
D:\project\ai\ai-project\keystore>keytool -list -v -keystore D:\project\ai\ai-project\keystore\keystore
輸入金鑰儲存庫密碼:
憑證指紋:
         SHA1: 71:42:04:CC:FB:4E:EE:6C:FE:4A:51:95:CC:CE:16:B8:07:F9:D5:C5
         SHA256: D0:52:6A:5B:C5:A6:94:81:56:AC:CE:DA:62:48:73:93:DF:CC:ED:58:88:D6:AA:3A:67:F4:2D:32:71:EE:02:CE

隱私權政策
https://tw.anotepad.com/privacy

簡易的任務行事曆.具有儲存會議時間及任務管理的功能.
可分成每日,每周,每月,每年方式來檢視.
生活的好夥伴

lancewu7@gmail.com,wu.lance@gmail.com,lancewu79@gmail.com,lancewu80@gmail.com,lancewu81@gmail.com,lancewu3@gmail.com,tibcotw@gmail.com,cht1683f2@gmail.com,lancewu56@gmail.com,augustlee46@gmail.com,wuleon222@gmail.com,taipinglu168@gmail.com

Opted in
lancewu80@gmail.com
lancewu7@gmail.com
taipinglu168@gmail.com
lancewu3@gmail.com
cht1683f2@gmail.com
augustlee46@gmail.com
lancewu56@gmail.com
tibcotw@gmail.com
wu.lance@gmail.com
wuleon222@gmail.com
lancewu79@gmail.com
lancewu81@gmail.com

https://play.google.com/apps/testing/com.calendarlllm.app

打開行事曆專案:D:\project\ai\ai-project\calendarlllm
月份view有個bug,點選某月份的某日後,接著點下個月或上個月,月份的日期鎖定在剛點選的月份不動.

# 1. 安裝依賴（含新加的 electron 等）
npm install

# 2. 開發模式測試
npm run electron:dev

# 3. 打包 Windows 版
npm run electron:build:win
# → 輸出到 electron-dist/CalendarLLM Setup x.x.x.exe

4. Mac打包
npm run electron:build:mac