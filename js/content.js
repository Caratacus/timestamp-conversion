let currentFormat = 'YYYY-MM-DD HH:mm:ss';
let currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let autoCloseDelay = 3000; // 默认3秒后自动关闭

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'updateSettings') {
    currentFormat = request.format;
    currentTimezone = request.timezone;
    if (request.autoCloseDelay) {
      autoCloseDelay = request.autoCloseDelay;
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
    background: white !important;
    padding: 20px !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
    z-index: 2147483647 !important;
    min-width: 300px !important;
    font-family: Arial, sans-serif !important;
    display: block !important;
  }
  .timestamp-popup * {
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }
  .timestamp-popup h3 {
    margin: 0 0 15px 0 !important;
    font-size: 16px !important;
    color: #333 !important;
  }
  .timestamp-popup .time-row {
    margin: 10px 0 !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .timestamp-popup .time-label {
    color: #666 !important;
    flex-shrink: 0 !important;
    margin-right: 10px !important;
  }
  .timestamp-popup .time-value {
    color: #333 !important;
    font-weight: bold !important;
    text-align: right !important;
    word-break: break-all !important;
  }
  .timestamp-popup .close-btn {
    position: absolute !important;
    right: 10px !important;
    top: 10px !important;
    cursor: pointer !important;
    color: #999 !important;
    font-size: 18px !important;
    width: 20px !important;
    height: 20px !important;
    line-height: 20px !important;
    text-align: center !important;
  }
  .timestamp-popup .close-btn:hover {
    color: #666 !important;
  }
  .timestamp-popup .auto-close-timer {
    position: absolute !important;
    bottom: 10px !important;
    right: 10px !important;
    font-size: 12px !important;
    color: #999 !important;
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
    
    popup.innerHTML = `
      <div class="close-btn">&times;</div>
      <h3>时间戳转换</h3>
      <div class="time-row">
        <span class="time-label">时间戳:</span>
        <span class="time-value">${timestamp}</span>
      </div>
      <div class="time-row">
        <span class="time-label">转换结果:</span>
        <span class="time-value">${convertedTime}</span>
      </div>
      <div class="time-row">
        <span class="time-label">时区:</span>
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
        timerElement.textContent = `${remainingTime}秒后自动关闭`;
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
      timerElement.textContent = '自动关闭已暂停';
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