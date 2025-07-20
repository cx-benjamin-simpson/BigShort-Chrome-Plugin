// Popup script for the Chrome extension
document.addEventListener('DOMContentLoaded', function() {
  const statusDiv = document.getElementById('status');
  const alertCountDiv = document.getElementById('alertCount');
  const testAlarmBtn = document.getElementById('testAlarm');
  const toggleMuteBtn = document.getElementById('toggleMute');
  const resetCountBtn = document.getElementById('resetCount');
  const toggleBtn = document.getElementById('toggleMonitoring');

  // Check status on load
  checkStatus();
  updateAlertCount();

  // Test alarm button
  testAlarmBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'testAlarm'}, function(response) {
        console.log('Test alarm sent');
      });
    });
  });

  // Toggle mute button
  toggleMuteBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'window.toggleTradingAlerts && window.toggleTradingAlerts();'
      }, function() {
        updateMuteButton();
        updateAlertCount();
      });
    });
  });

  // Reset count button
  resetCountBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'window.resetTradingAlertCount && window.resetTradingAlertCount();'
      }, function() {
        updateAlertCount();
      });
    });
  });

  // Toggle monitoring button
  toggleBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleMonitoring'}, function(response) {
        checkStatus();
      });
    });
  });

  function updateMuteButton() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'window.isMuted || false;'
      }, function(result) {
        const isMuted = result && result[0];
        toggleMuteBtn.textContent = isMuted ? 'Unmute Alerts' : 'Mute Alerts';
        toggleMuteBtn.className = isMuted ? 'secondary muted' : 'secondary';
      });
    });
  }

  function updateAlertCount() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'window.alertCount || 0;'
      }, function(result) {
        const count = result && result[0] ? result[0] : 0;
        alertCountDiv.textContent = `Alerts: ${count}/5`;
        
        // Change color based on count
        if (count >= 5) {
          alertCountDiv.style.backgroundColor = '#f8d7da';
          alertCountDiv.style.color = '#721c24';
        } else if (count >= 3) {
          alertCountDiv.style.backgroundColor = '#fff3cd';
          alertCountDiv.style.color = '#856404';
        } else {
          alertCountDiv.style.backgroundColor = '#f8f9fa';
          alertCountDiv.style.color = '#000';
        }
      });
    });
  }

  function checkStatus() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
        if (response && response.status === 'active') {
          statusDiv.textContent = 'Status: Active';
          statusDiv.className = 'status active';
        } else {
          statusDiv.textContent = 'Status: Inactive';
          statusDiv.className = 'status inactive';
        }
      });
    });
  }
}); 