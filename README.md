# WARNING THIS IS UNDER DEVELOPMENT!!!!! please dont trust money to any output of this program without verifying the results!



A Chrome extension that monitors trading data and alerts when Put Wall 7 DTE exceeds Call Wall 7 DTE.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `chromeplugin` folder
4. The extension should now appear in your extensions list

## Usage

1. Navigate to a trading platform page with the required data
2. Click the extension icon in the toolbar to open the popup
3. The extension will automatically start monitoring the page
4. When Put Wall 7 DTE exceeds Call Wall 7 DTE, an audio alarm will play

## Features

- Automatic monitoring of trading data
- Audio alerts when conditions are met
- Test alarm functionality
- Status monitoring through popup

## Files

- `manifest.json` - Extension configuration
- `content.js` - Content script that injects the monitoring script
- `monoscript.js` - Main monitoring logic
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons (need to be added)

## Notes

- The extension requires the page to have the specific HTML structure with tooltip tables
- Audio alerts use the Web Audio API for reliability
- Make sure to add icon files (16x16, 48x48, 128x128 pixels) to complete the extension 
