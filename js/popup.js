document.addEventListener('DOMContentLoaded', function() {
  const formatSelect = document.getElementById('formatSelect');
  const timezoneSelect = document.getElementById('timezoneSelect');
  const autoCloseSelect = document.getElementById('autoCloseSelect');
  
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
}); 