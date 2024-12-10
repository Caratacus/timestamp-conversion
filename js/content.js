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
  const offset = formatter.format(date).split(' ').pop();
  const abbreviation = shortFormatter.format(date).split(' ').pop();
  return `${timezone} (${abbreviation}, ${offset})`;
}

// 创建按钮样式
const style = document.createElement('style');
style.textContent = `
  .timestamp-convert-btn {
    position: absolute;
    background: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .timestamp-convert-btn:hover {
    background: #444;
  }
  .timestamp-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10000;
    min-width: 300px;
  }
  .timestamp-popup h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #333;
  }
  .timestamp-popup .time-row {
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .timestamp-popup .time-label {
    color: #666;
    flex-shrink: 0;
    margin-right: 10px;
  }
  .timestamp-popup .time-value {
    color: #333;
    font-weight: bold;
    text-align: right;
    word-break: break-all;
  }
  .timestamp-popup .close-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
    color: #999;
    font-size: 18px;
  }
  .timestamp-popup .close-btn:hover {
    color: #666;
  }
  .timestamp-popup .auto-close-timer {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 12px;
    color: #999;
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
  
  button.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    showTimestampPopup(timestamp);
    button.remove();
  };
  
  return button;
}

// 创建并显示弹出框
function showTimestampPopup(timestamp) {
  // 移除已存在的弹窗
  const existingPopup = document.querySelector('.timestamp-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = document.createElement('div');
  popup.className = 'timestamp-popup';
  
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

  // 自动关闭倒计时
  let remainingTime = Math.floor(autoCloseDelay / 1000);
  const timerElement = popup.querySelector('.auto-close-timer');
  
  const updateTimer = () => {
    if (remainingTime > 0) {
      timerElement.textContent = `${remainingTime}秒后自动关闭`;
      remainingTime--;
    }
  };
  
  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);

  // 自动关闭定时器
  const autoCloseTimer = setTimeout(() => {
    popup.remove();
    clearInterval(timerInterval);
  }, autoCloseDelay);

  // 点击关闭按钮关闭弹窗
  const closeBtn = popup.querySelector('.close-btn');
  closeBtn.onclick = () => {
    popup.remove();
    clearTimeout(autoCloseTimer);
    clearInterval(timerInterval);
  };

  // 点击弹窗外部关闭弹窗
  document.addEventListener('click', function closePopup(e) {
    if (!popup.contains(e.target)) {
      popup.remove();
      clearTimeout(autoCloseTimer);
      clearInterval(timerInterval);
      document.removeEventListener('click', closePopup);
    }
  });

  // 鼠标悬停时暂停自动关闭
  popup.addEventListener('mouseenter', () => {
    clearTimeout(autoCloseTimer);
    clearInterval(timerInterval);
    timerElement.textContent = '自动关闭已暂停';
  });

  // 鼠标离开时恢复自动关闭
  popup.addEventListener('mouseleave', () => {
    remainingTime = Math.floor(autoCloseDelay / 1000);
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    const autoCloseTimer = setTimeout(() => {
      popup.remove();
      clearInterval(timerInterval);
    }, autoCloseDelay);
  });
}

// 监听选中文本事件
document.addEventListener('mouseup', (e) => {
  // 移除已存在的转换按钮
  const existingBtn = document.querySelector('.timestamp-convert-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (timestampRegex.test(text)) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const button = createConvertButton(
      text,
      rect.left + window.scrollX,
      rect.bottom + window.scrollY + 5
    );
    document.body.appendChild(button);
  }
});

// 点击页面时移除转换按钮
document.addEventListener('mousedown', (e) => {
  if (!e.target.classList.contains('timestamp-convert-btn')) {
    const existingBtn = document.querySelector('.timestamp-convert-btn');
    if (existingBtn) {
      existingBtn.remove();
    }
  }
}); 