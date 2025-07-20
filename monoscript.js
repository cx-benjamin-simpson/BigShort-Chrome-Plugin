// Global state for mute control
let isMuted = false;
let lastAlertTime = 0;
let alertCount = 0;
let lastPutWall = null;
let lastCallWall = null;
const ALERT_COOLDOWN = 5000; // 5 seconds between alerts
const MAX_ALERTS = 5; // Auto-mute after 5 alerts

// Function to toggle mute
function toggleMute() {
  isMuted = !isMuted;
  if (!isMuted) {
    alertCount = 0; // Reset alert count when unmuting
  }
  console.log('Alerts are now:', isMuted ? 'MUTED' : 'UNMUTED');
  return isMuted;
}

// Function to reset alert count (for manual unmuting)
function resetAlertCount() {
  alertCount = 0;
  console.log('Alert count reset to 0');
}

// Function to get current alert count (for debugging)
function getAlertCount() {
  return alertCount;
}

// Make functions available globally
window.toggleTradingAlerts = toggleMute;
window.resetTradingAlertCount = resetAlertCount;
window.getTradingAlertCount = getAlertCount;

// Continuous monitoring function
function monitorTradingData() {
  // 1. Find the chart SVG element using XPath
  const xpath = '/html/body/div[1]/div[1]/main/div[1]/div[2]/div[2]/div/svg/g[52]/g[23]';
  const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const chartG = result.singleNodeValue;
  if (chartG) {
    const svg = chartG.ownerSVGElement;
    if (svg) {
      const svgRect = svg.getBoundingClientRect();
      // 2. Calculate the coordinates: 2px to the left of the right edge, vertically centered
      const x = svgRect.right - 2;
      const y = svgRect.top + svgRect.height / 2;

      // 3. Simulate mousemove at that point
      const targetElement = document.elementFromPoint(x, y);
      if (targetElement) {
        const mouseMoveEvent = new MouseEvent('mousemove', {
          clientX: x,
          clientY: y,
          bubbles: true,
          cancelable: true,
          view: window
        });
        targetElement.dispatchEvent(mouseMoveEvent);
        // console.log(`Simulated mousemove at (${x}, ${y})`);
      } else {
        console.error('No element found at the simulated coordinates.');
      }
    }
  } else {
    console.error('Chart group not found.');
  }

  // 4. Wait a bit for the tooltip to appear, then check the data
  setTimeout(() => {
    const tooltipTable = document.querySelector('.highcharts-tooltip table');
    if (tooltipTable) {
      const firstCell = tooltipTable.querySelector('tr td');
      if (firstCell && firstCell.textContent.includes("Stock Price")) {
        // --- Existing logic for extracting and alerting on Put Wall/Call Wall ---
        const html = tooltipTable.outerHTML;
        function extractValue(label) {
          const regex = new RegExp(label + '[^\\d-]*([\\d.\\-kM]+)', 'i');
          const match = html.match(regex);
          if (!match) return null;
          let value = match[1];
          if (value.endsWith('k')) return parseFloat(value) * 1e3;
          if (value.endsWith('M')) return parseFloat(value) * 1e6;
          return parseFloat(value);
        }
        const putWall = extractValue('Put Wall 7 DTE');
        const callWall = extractValue('Call Wall 7 DTE');
        if (putWall !== null && callWall !== null) {
          // Check if values have changed (reset alert count and unmute if they have)
          if (putWall !== lastPutWall || callWall !== lastCallWall) {
            alertCount = 0;
            isMuted = false;
            console.log('Values changed - Reset alert count to 0 and unmuted alarm');
            console.log('Put Wall:', lastPutWall, '→', putWall);
            console.log('Call Wall:', lastCallWall, '→', callWall);
            // Play a short beep using Web Audio API for any change (lower frequency)
            try {
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // Lower frequency
              oscillator.type = 'sine';
              gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
              console.log('Web Audio API failed:', error);
            }
            lastPutWall = putWall;
            lastCallWall = callWall;
          }
          if (putWall > callWall) {
            const now = Date.now();
            const timeSinceLastAlert = now - lastAlertTime;
            // Check if we should alert (not muted and cooldown passed)
            if (!isMuted && timeSinceLastAlert > ALERT_COOLDOWN) {
              alertCount++;
              console.log(`ALERT #${alertCount}: Put Wall 7 DTE is greater than Call Wall 7 DTE:`, putWall, '>', callWall);
              lastAlertTime = now;
              // Auto-mute after MAX_ALERTS
              if (alertCount >= MAX_ALERTS) {
                isMuted = true;
                console.log(`AUTO-MUTED: Reached maximum alerts (${MAX_ALERTS}). Click "Unmute Alerts" to re-enable.`);
              }
              // Play a short beep using Web Audio API
              try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
              } catch (error) {
                console.log('Web Audio API failed:', error);
              }
            } else if (isMuted) {
              console.log('ALERT (MUTED): Put Wall 7 DTE is greater than Call Wall 7 DTE:', putWall, '>', callWall);
            } else {
              console.log('ALERT (COOLDOWN): Put Wall 7 DTE is greater than Call Wall 7 DTE:', putWall, '>', callWall);
            }
          } else {
            console.log('Put Wall 7 DTE is NOT greater than Call Wall 7 DTE:', putWall, '<=', callWall);
          }
        } else {
          console.log('Could not extract both Put Wall and Call Wall values.');
        }
      }
    }
  }, 200);
}

// Start continuous monitoring every 2 seconds
console.log('Starting continuous trading data monitoring...');
monitorTradingData(); // Run immediately
setInterval(monitorTradingData, 2000); // Then run every 2 seconds