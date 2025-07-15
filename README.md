# Blur My Screen

A privacy-focused Chrome Extension to instantly blur your current browser tab by pressing the **Ctrl+B** key.

## Features

- Global passcode protection
- Quick blur/unblur using the keyboard
- Automatically restores blur state on reload

## How to Use

1. You can load the extension manually.
2. On first install, set a global passcode.
3. Visit any site, press `Ctrl B` to blur the screen.
4. Press `Ctrl B` again to unblur and enter your passcode.

## Load Unpacked Extension

To test locally:

1. Clone this repo.
2. Go to `chrome://extensions/` in your browser.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select this project folder.

## Permissions

This extension uses:

- `storage` – to save passcode and config
- `activeTab` – to communicate with the current tab
