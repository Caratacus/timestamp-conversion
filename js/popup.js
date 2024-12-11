document.addEventListener('DOMContentLoaded', function() {
  const formatSelect = document.getElementById('formatSelect');
  const timezoneSelect = document.getElementById('timezoneSelect');
  const autoCloseSelect = document.getElementById('autoCloseSelect');
  const languageSelect = document.getElementById('languageSelect');

  // 加载所有翻译文本
  const translations = {
    en: {
      popupTitle: "Timestamp Converter",
      formatLabel: "Time Format:",
      timezoneLabel: "Timezone:",
      autoCloseLabel: "Auto Close:",
      autoCloseOption3s: "3 seconds",
      autoCloseOption5s: "5 seconds",
      autoCloseOption8s: "8 seconds",
      autoCloseOption10s: "10 seconds",
      autoCloseOption15s: "15 seconds",
      autoCloseOptionNever: "Never",
      usageHint: "Select any timestamp on the page to convert",
      supportHint: "Supports 10-digit (seconds) and 13-digit (milliseconds) timestamps",
      languageLabel: "Language:"
    },
    zh_CN: {
      popupTitle: "时间戳转换工具",
      formatLabel: "时间格式:",
      timezoneLabel: "时区:",
      autoCloseLabel: "自动关闭时间:",
      autoCloseOption3s: "3 秒",
      autoCloseOption5s: "5 秒",
      autoCloseOption8s: "8 秒",
      autoCloseOption10s: "10 秒",
      autoCloseOption15s: "15 秒",
      autoCloseOptionNever: "不自动关闭",
      usageHint: "点击页面上的时间戳即可转换",
      supportHint: "支持10位（秒）和13位（毫秒）时间戳",
      languageLabel: "语言:"
    },
    zh_TW: {
      popupTitle: "時間戳轉換工具",
      formatLabel: "時間格式:",
      timezoneLabel: "時區:",
      autoCloseLabel: "自動關閉時間:",
      autoCloseOption3s: "3 秒",
      autoCloseOption5s: "5 秒",
      autoCloseOption8s: "8 秒",
      autoCloseOption10s: "10 秒",
      autoCloseOption15s: "15 秒",
      autoCloseOptionNever: "不自動關閉",
      usageHint: "點擊頁面上的時間戳即可轉換",
      supportHint: "支持10位（秒）和13位（毫秒）時間戳",
      languageLabel: "語言:"
    },
    ja: {
      popupTitle: "タイムスタンプ変換ツール",
      formatLabel: "時刻形式:",
      timezoneLabel: "タイムゾーン:",
      autoCloseLabel: "自動閉じる:",
      autoCloseOption3s: "3 秒",
      autoCloseOption5s: "5 秒",
      autoCloseOption8s: "8 秒",
      autoCloseOption10s: "10 秒",
      autoCloseOption15s: "15 秒",
      autoCloseOptionNever: "閉じない",
      usageHint: "ページ上のタイムスタンプを選択して変換",
      supportHint: "10桁（秒）と13桁（ミリ秒）のタイムスタンプに対応",
      languageLabel: "言語:"
    },
    ko: {
      popupTitle: "타임스탬프 변환 도구",
      formatLabel: "시간 형식:",
      timezoneLabel: "시간대:",
      autoCloseLabel: "자동 닫기:",
      autoCloseOption3s: "3 초",
      autoCloseOption5s: "5 초",
      autoCloseOption8s: "8 초",
      autoCloseOption10s: "10 초",
      autoCloseOption15s: "15 초",
      autoCloseOptionNever: "닫지 않음",
      usageHint: "페이지에서 타임스탬프를 선택하여 변환",
      supportHint: "10자리(초) 및 13자리(밀리초) 타임스탬프 지원",
      languageLabel: "언어:"
    },
    th: {
      popupTitle: "เครื่องมือแปลงตราประทับเวลา",
      formatLabel: "รูปแบบเวลา:",
      timezoneLabel: "เขตเวลา:",
      autoCloseLabel: "ปิดอัตโนมัติ:",
      autoCloseOption3s: "3 วินาที",
      autoCloseOption5s: "5 วินาที",
      autoCloseOption8s: "8 วินาที",
      autoCloseOption10s: "10 วินาที",
      autoCloseOption15s: "15 วินาที",
      autoCloseOptionNever: "ไม่ปิด",
      usageHint: "เลือกตราประทับเวลาบนหน้าเว็บเพื่อแปลง",
      supportHint: "รองรับตราประทับเวลา 10 หลัก (วินาที) และ 13 หลัก (มิลลิวินาที)",
      languageLabel: "ภาษา:"
    }
  };

  // 更新页面文本
  function updateTexts(lang) {
    const texts = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (texts[key]) {
        if (element.tagName === 'OPTION') {
          element.textContent = texts[key];
        } else {
          element.textContent = texts[key];
        }
      }
    });
  }

  // 初始化语言
  chrome.storage.local.get('language', function(result) {
    const defaultLang = navigator.language.replace('-', '_').startsWith('zh_') ? 
      (navigator.language.toLowerCase() === 'zh-tw' ? 'zh_TW' : 'zh_CN') : 'en';
    
    const currentLang = result.language || defaultLang;
    languageSelect.value = currentLang;
    updateTexts(currentLang);
  });

  // 监听语言变化
  languageSelect.addEventListener('change', function() {
    const newLang = this.value;
    chrome.storage.local.set({ language: newLang }, function() {
      updateTexts(newLang);
      // 通知 content script 更新语言
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'updateLanguage',
          language: newLang
        });
      });
    });
  });

  // 填充时区选择器
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // 常用时区列表
  const commonTimezones = [
    'Asia/Shanghai',
    'Asia/Tokyo',
    'America/New_York',
    'Europe/London',
    'UTC'
  ];

  // 所有时区列表
  const timezones = Intl.supportedValuesOf('timeZone');

  // 添加常用时区
  commonTimezones.forEach(tz => {
    const option = document.createElement('option');
    option.value = tz;
    try {
      const date = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short'
      });
      const timeZoneStr = formatter.format(date).split(' ').pop();
      option.textContent = `${tz} (${timeZoneStr})`;
    } catch (e) {
      option.textContent = tz;
    }
    if (tz === userTimezone) {
      option.selected = true;
    }
    timezoneSelect.appendChild(option);
  });

  // 添加分隔线
  const separator = document.createElement('option');
  separator.disabled = true;
  separator.textContent = '──────────';
  timezoneSelect.appendChild(separator);

  // 添加其他时区
  timezones.forEach(timezone => {
    if (!commonTimezones.includes(timezone)) {
      const option = document.createElement('option');
      option.value = timezone;
      try {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          timeZoneName: 'short'
        });
        const timeZoneStr = formatter.format(date).split(' ').pop();
        option.textContent = `${timezone} (${timeZoneStr})`;
      } catch (e) {
        option.textContent = timezone;
      }
      if (timezone === userTimezone && !commonTimezones.includes(userTimezone)) {
        option.selected = true;
      }
      timezoneSelect.appendChild(option);
    }
  });
  
  // 从存储中加载设置
  chrome.storage.local.get(['format', 'timezone', 'autoCloseDelay'], function(result) {
    if (result.format) {
      formatSelect.value = result.format;
    }
    if (result.timezone) {
      timezoneSelect.value = result.timezone;
    }
    if (result.autoCloseDelay !== undefined) {
      autoCloseSelect.value = result.autoCloseDelay.toString();
    }
  });
  
  // 监听设置变化
  function updateSettings() {
    const settings = {
      format: formatSelect.value,
      timezone: timezoneSelect.value,
      autoCloseDelay: parseInt(autoCloseSelect.value)
    };
    
    // 保存设置
    chrome.storage.local.set(settings);
    
    // 发送消息到content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'updateSettings',
        ...settings
      });
    });
  }
  
  formatSelect.addEventListener('change', updateSettings);
  timezoneSelect.addEventListener('change', updateSettings);
  autoCloseSelect.addEventListener('change', updateSettings);

  // 初始化语言选择器
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'zh_CN', label: '简体中文' },
    { value: 'zh_TW', label: '繁體中文' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'th', label: 'ไทย' }
  ];

  // 清空并重新填充语言选择器
  languageSelect.innerHTML = languageOptions.map(lang => 
    `<option value="${lang.value}">${lang.label}</option>`
  ).join('');
}); 