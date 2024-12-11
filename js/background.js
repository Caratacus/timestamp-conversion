// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'changeLanguage') {
    // 保存语言设置
    chrome.storage.local.set({ language: request.language });
  }
}); 