let currentFormat = 'YYYY-MM-DD HH:mm:ss';
let currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let autoCloseDelay = 5000; // 默认5秒后自动关闭
let currentLanguage = 'en'; // 默认语言

// 翻译文本
const translations = {
  en: {
    popupTitle: "Timestamp Converter",
    popupTimestamp: "Timestamp:",
    popupLocalTime: "Local Time:",
    popupUTCTime: "UTC Time:",
    popupTimezone: "Timezone:",
    autoCloseCountdown: "Auto closing in $1 seconds",
    autoClosePaused: "Auto close paused"
  },
  zh_CN: {
    popupTitle: "时间戳转换工具",
    popupTimestamp: "时间戳:",
    popupLocalTime: "本地时间:",
    popupUTCTime: "UTC时间:",
    popupTimezone: "时区:",
    autoCloseCountdown: "$1秒后自动关闭",
    autoClosePaused: "自动关闭已暂停"
  },
  zh_TW: {
    popupTitle: "時間戳轉換工具",
    popupTimestamp: "時間戳:",
    popupLocalTime: "本地時間:",
    popupUTCTime: "UTC時間:",
    popupTimezone: "時區:",
    autoCloseCountdown: "$1秒後自動關閉",
    autoClosePaused: "自動關閉已暫停"
  },
  ja: {
    popupTitle: "タイムスタンプ変換ツール",
    popupTimestamp: "タイムスタンプ:",
    popupLocalTime: "ローカル時間:",
    popupUTCTime: "UTC時間:",
    popupTimezone: "タイムゾーン:",
    autoCloseCountdown: "$1秒後に自動的に閉じます",
    autoClosePaused: "自動閉じる停止中"
  },
  ko: {
    popupTitle: "타임스탬프 변환 도구",
    popupTimestamp: "타임스탬프:",
    popupLocalTime: "현지 시간:",
    popupUTCTime: "UTC 시간:",
    popupTimezone: "시간대:",
    autoCloseCountdown: "$1초 후 자동으로 닫힘",
    autoClosePaused: "자동 닫기 일시 중지"
  },
  th: {
    popupTitle: "เครื่องมือแปลงตราประทับเวลา",
    popupTimestamp: "ตราประทับเวลา:",
    popupLocalTime: "เวลาท้องถิ่น:",
    popupUTCTime: "เวลา UTC:",
    popupTimezone: "เขตเวลา:",
    autoCloseCountdown: "ปิดอัตโนมัติใน $1 วินาที",
    autoClosePaused: "หยุดการปิดอัตโนมัติ"
  }
};

// 获取翻译文本
function getMessage(key, substitutions = []) {
  const text = translations[currentLanguage][key];
  if (!text) return key;
  return substitutions.reduce((str, sub, i) => str.replace(`$${i + 1}`, sub), text);
}

// 从存储中加载设置
chrome.storage.local.get(['format', 'timezone', 'autoCloseDelay', 'language'], function(result) {
  if (result.format) {
    currentFormat = result.format;
  }
  if (result.timezone) {
    currentTimezone = result.timezone;
  }
  if (result.autoCloseDelay !== undefined) {
    autoCloseDelay = parseInt(result.autoCloseDelay);
  }
  if (result.language) {
    currentLanguage = result.language;
  }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'updateSettings') {
    currentFormat = request.format;
    currentTimezone = request.timezone;
    if (request.autoCloseDelay !== undefined) {
      autoCloseDelay = parseInt(request.autoCloseDelay);
    }
  } else if (request.type === 'updateLanguage') {
    currentLanguage = request.language;
    // 如果当前有弹出层，更新其文本
    const popup = document.querySelector('.timestamp-popup');
    if (popup) {
      const timestamp = popup.querySelector('.time-value').textContent;
      showTimestampPopup(timestamp);
    }
  }
});

// 检测时间戳的正则表达式
const timestampRegex = /^\d{10}$|^\d{13}$/;

// 获取时区详细信息
function getTimezoneInfo(timezone) {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'long'
  });
  const shortFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short'
  });
  const abbreviation = shortFormatter.format(date).split(' ').pop().replace('Time', '');
  return `${timezone} (${abbreviation})`;
}

// 创建按钮样式
const style = document.createElement('style');
style.textContent = `
  .timestamp-popup {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    padding: 20px !important;
    border-radius: 10px !important;
    box-shadow: 0 2px 24px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.2) !important;
    z-index: 2147483647 !important;
    min-width: 300px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    display: block !important;
    border: 0.5px solid rgba(0, 0, 0, 0.1) !important;
  }
  .timestamp-popup * {
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }
  .timestamp-popup h3 {
    margin: 0 0 15px 0 !important;
    font-size: 16px !important;
    color: #1d1d1f !important;
    font-weight: 500 !important;
    letter-spacing: -0.2px !important;
  }
  .timestamp-popup .time-row {
    margin: 8px 0 !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 4px 0 !important;
  }
  .timestamp-popup .time-label {
    color: #86868b !important;
    flex-shrink: 0 !important;
    margin-right: 12px !important;
    font-size: 14px !important;
  }
  .timestamp-popup .time-value {
    color: #1d1d1f !important;
    font-size: 14px !important;
    text-align: right !important;
    word-break: break-all !important;
  }
  .timestamp-popup .close-btn {
    position: absolute !important;
    right: 12px !important;
    top: 12px !important;
    cursor: pointer !important;
    color: #86868b !important;
    font-size: 16px !important;
    width: 20px !important;
    height: 20px !important;
    line-height: 20px !important;
    text-align: center !important;
    border-radius: 50% !important;
    transition: all 0.2s ease !important;
  }
  .timestamp-popup .close-btn:hover {
    background-color: rgba(0, 0, 0, 0.05) !important;
    color: #1d1d1f !important;
  }
  .timestamp-popup .auto-close-timer {
    position: absolute !important;
    bottom: 12px !important;
    right: 12px !important;
    font-size: 12px !important;
    color: #86868b !important;
  }
`;
document.head.appendChild(style);

// 转换时间戳函数
function convertTimestamp(timestamp) {
  const ts = timestamp.length === 10 ? timestamp * 1000 : timestamp;
  const date = new Date(parseInt(ts));
  
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: currentTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const values = {};
  parts.forEach(part => {
    values[part.type] = part.value;
  });

  return currentFormat
    .replace('YYYY', values.year)
    .replace('MM', values.month)
    .replace('DD', values.day)
    .replace('HH', values.hour)
    .replace('mm', values.minute)
    .replace('ss', values.second)
    .replace('年', '年')
    .replace('月', '月')
    .replace('日', '日');
}

// 创建转换按钮
function createConvertButton(timestamp, x, y) {
  const button = document.createElement('div');
  button.className = 'timestamp-convert-btn';
  button.textContent = '转换时间戳';
  button.style.left = `${x}px`;
  button.style.top = `${y}px`;
  
  button.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      showTimestampPopup(timestamp);
      console.log('显示弹出层', timestamp);
    } catch (error) {
      console.error('显示弹出层时出错:', error);
    }
    button.remove();
  });
  
  return button;
}

// 创建并显示弹出框
function showTimestampPopup(timestamp) {
  console.log('开始创建弹出层');
  // 移除已存在的弹窗
  const existingPopup = document.querySelector('.timestamp-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = document.createElement('div');
  popup.className = 'timestamp-popup';
  
  try {
    const convertedTime = convertTimestamp(timestamp);
    const date = new Date(timestamp.length === 10 ? timestamp * 1000 : parseInt(timestamp));
    const timezoneInfo = getTimezoneInfo(currentTimezone);
    
    // 获取UTC时间
    const utcTime = date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
    
    popup.innerHTML = `
      <div class="close-btn">&times;</div>
      <h3>${getMessage('popupTitle')}</h3>
      <div class="time-row">
        <span class="time-label">${getMessage('popupTimestamp')}</span>
        <span class="time-value">${timestamp}</span>
      </div>
      <div class="time-row">
        <span class="time-label">${getMessage('popupUTCTime')}</span>
        <span class="time-value">${utcTime}</span>
      </div>
      <div class="time-row">
        <span class="time-label">${getMessage('popupLocalTime')}</span>
        <span class="time-value">${convertedTime}</span>
      </div>
      <div class="time-row">
        <span class="time-label">${getMessage('popupTimezone')}</span>
        <span class="time-value">${timezoneInfo}</span>
      </div>
      <div class="auto-close-timer"></div>
    `;

    document.body.appendChild(popup);
    console.log('弹出层已创建并添加到页面');

    let autoCloseTimer = null;
    let timerInterval = null;
    let remainingTime = Math.floor(autoCloseDelay / 1000);
    const timerElement = popup.querySelector('.auto-close-timer');
    
    const updateTimer = () => {
      if (remainingTime > 0) {
        timerElement.textContent = getMessage('autoCloseCountdown', [remainingTime.toString()]);
        remainingTime--;
      }
    };

    const startTimer = () => {
      remainingTime = Math.floor(autoCloseDelay / 1000);
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
      autoCloseTimer = setTimeout(() => {
        popup.remove();
        clearInterval(timerInterval);
      }, autoCloseDelay);
    };

    const stopTimer = () => {
      clearTimeout(autoCloseTimer);
      clearInterval(timerInterval);
      timerElement.textContent = getMessage('autoClosePaused');
    };

    // 点击关闭按钮关闭弹窗
    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.onclick = () => {
      popup.remove();
      stopTimer();
    };

    // 点击弹窗外部关闭弹窗
    document.addEventListener('click', function closePopup(e) {
      if (!popup.contains(e.target)) {
        popup.remove();
        stopTimer();
        document.removeEventListener('click', closePopup);
      }
    });

    // 鼠标悬停时暂停自动关闭
    popup.addEventListener('mouseenter', stopTimer);

    // 鼠标离开时开始计时
    popup.addEventListener('mouseleave', startTimer);

    // 初始启动计时器
    startTimer();
  } catch (error) {
    console.error('显示弹出层时出错:', error);
  }
}

// 监听选中文本事件
document.addEventListener('mouseup', (e) => {
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (timestampRegex.test(text)) {
      try {
        showTimestampPopup(text);
      } catch (error) {
        console.error('显示弹出层时出错:', error);
      }
    }
  }, 0);
});

// 点击页面时移除弹出层
document.addEventListener('click', (e) => {
  if (!e.target.closest('.timestamp-popup')) {
    const existingPopup = document.querySelector('.timestamp-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
  }
}); 