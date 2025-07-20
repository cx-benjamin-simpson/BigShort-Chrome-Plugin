// Content script that injects the trading monitor script
console.log('Trading Data Monitor: Content script loaded');

// Function to inject the main script
function injectTradingScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('monoscript.js');
  script.onload = function() {
    console.log('Trading Data Monitor: Main script injected successfully');
  };
  (document.head || document.documentElement).appendChild(script);
}

// Inject the script when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectTradingScript);
} else {
  injectTradingScript();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({ status: 'active' });
  }
}); 