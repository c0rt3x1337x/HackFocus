# HackFocus Installation Guide

## Quick Start

1. **Download/Clone** this repository to your computer
2. **Open Firefox** and navigate to `about:debugging`
3. **Click "This Firefox"** in the left sidebar
4. **Click "Load Temporary Add-on"**
5. **Select the `manifest.json` file** from the HackFocus folder
6. **Start hacking!** Click the HackFocus icon in your toolbar

> **Note**: The extension now uses Manifest V2 format for better Firefox compatibility. All icon files are included as PNG images.

## Icon Setup (Complete)

The extension now includes proper PNG icon files:
- `icon-16.png` (16x16 pixels)
- `icon-32.png` (32x32 pixels) 
- `icon-48.png` (48x48 pixels)
- `icon-128.png` (128x128 pixels)

All icons feature a hacker-themed "H" logo with green-on-black styling. No additional setup required!

## Features Overview

### 🎯 Pomodoro Timer
- **Start/Stop**: Click the extension icon and use "INITIATE HACK" / "ABORT MISSION"
- **Customizable**: Set focus duration (15-60 min), break times (3-30 min)
- **Auto-breaks**: Automatically switch between focus and break sessions
- **Progress tracking**: Visual progress bar and mission status

### 🚫 Site Blocking
- **Enable blocking**: Go to options → Site Blocking → Enable site blocking
- **Choose mode**:
  - **Block List**: Block only specified sites (default: social media)
  - **Allow List**: Block everything except specified sites
- **Add sites**: Enter domains like `facebook.com`, `youtube.com`
- **Block page**: Hacker-style "ACCESS DENIED" screen with countdown

### 🎮 Gamification
- **Mission themes**: Choose from Mainframe, Vault, Satellite, or Matrix
- **Progress messages**: "Establishing backdoor...", "Decrypting payload...", etc.
- **Session tracking**: View statistics and streaks
- **Hacker aesthetics**: Terminal UI, ASCII art, glitch effects

## Configuration

### Access Options
- Click extension icon → "Configure Mission Parameters"
- Or right-click extension → "Options"

### Key Settings
- **Timer durations**: Focus, short break, long break
- **Site lists**: Add/remove blocked or allowed domains
- **Mission theme**: Choose your hacking scenario
- **Auto-breaks**: Enable/disable automatic break transitions

## Troubleshooting

### Extension Not Loading
- Make sure you selected the `manifest.json` file (not a folder)
- Check that all files are in the same directory
- Try refreshing the `about:debugging` page

### Site Blocking Not Working
- Ensure site blocking is enabled in options
- Check that you're using the correct domain format (e.g., `facebook.com`, not `www.facebook.com`)
- Verify the extension has the necessary permissions

### Timer Issues
- Check that notifications are enabled for Firefox
- Make sure the extension isn't being blocked by other extensions
- Try reloading the extension if timers stop working

## File Structure
```
HackFocus/
├── manifest.json          # Extension configuration
├── popup.html            # Main interface
├── popup.css             # Styling
├── popup.js              # Timer logic
├── background.js         # Background service worker
├── options.html          # Settings page
├── options.js            # Options functionality
├── blocked.html          # Block page
├── icons/                # Extension icons
├── README.md             # Documentation
└── INSTALLATION.md       # This file
```

## Permissions Explained

- **Storage**: Save your settings and progress
- **Alarms**: Run the Pomodoro timer
- **Notifications**: Alert you when sessions complete
- **WebRequest**: Block distracting websites
- **ActiveTab**: Access current tab information
- **Tabs**: Manage browser tabs

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all files are present and properly formatted
3. Try reloading the extension
4. Check Firefox's extension permissions

---

**Ready to hack your productivity? Let's go! 🚀**
