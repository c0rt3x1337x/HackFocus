# HackFocus - Firefox MV3 Extension

A hacker-themed Pomodoro timer extension for Firefox that helps you stay focused and productive.

## Features

### 🎯 Pomodoro Timer
- Customizable focus sessions (15-60 minutes)
- Automatic short and long breaks
- Hacker-themed mission progress tracking
- Session statistics and streaks

### 🚫 Site Blocking
- Block distracting websites during focus sessions
- Choose between blocklist or allowlist mode
- Customizable site lists
- Hacker-style "ACCESS DENIED" block page

### 🎮 Gamification
- Mission-based progress tracking
- Different themes: Mainframe, Vault, Satellite, Matrix
- Hacker-style notifications and messages
- ASCII art and terminal aesthetics

### 🎨 Hacker Theme
- Dark terminal-style UI
- Green-on-black color scheme
- Glitch animations and effects
- Matrix-style rain effects on block page

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from this directory
6. The extension will be loaded and ready to use!

### Building Icons

The extension requires icon files in the `icons/` directory:
- `icon-16.png` (16x16 pixels)
- `icon-32.png` (32x32 pixels) 
- `icon-48.png` (48x48 pixels)
- `icon-128.png` (128x128 pixels)

You can create these icons or use placeholder images for testing.

## Usage

### Starting a Focus Session
1. Click the HackFocus icon in your toolbar
2. Adjust timer settings if needed
3. Click "INITIATE HACK" to start your focus session
4. Watch your mission progress fill up!

### Configuring Site Blocking
1. Click the extension icon and select "Configure Mission Parameters"
2. Go to the "Site Blocking" tab
3. Enable site blocking and choose your mode:
   - **Block List**: Block only the sites you specify
   - **Allow List**: Block everything except the sites you specify
4. Add domains to your lists (e.g., `facebook.com`, `youtube.com`)
5. Save your configuration

### Mission Themes
Choose from different hacker mission themes:
- **Mainframe Hack**: Classic corporate system infiltration
- **Vault Breach**: High-security facility penetration  
- **Satellite Uplink**: Space-based communication hack
- **Matrix Protocol**: Reality-bending digital infiltration

## File Structure

```
HackFocus/
├── manifest.json          # Extension manifest
├── popup.html            # Main popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── background.js         # Background service worker
├── options.html          # Options/settings page
├── options.js            # Options functionality
├── blocked.html          # Site blocking page
├── icons/                # Extension icons
└── README.md             # This file
```

## Permissions

This extension requires the following permissions:
- `storage`: Save settings and progress
- `alarms`: Pomodoro timer functionality
- `notifications`: Session completion alerts
- `webRequest`: Block distracting websites
- `webRequestBlocking`: Block navigation requests
- `activeTab`: Access current tab information
- `tabs`: Manage browser tabs

## Development

### Testing
1. Load the extension in developer mode
2. Test the popup interface and timer functionality
3. Test site blocking with different domains
4. Verify settings persistence across browser restarts

### Customization
- Modify `popup.css` for UI styling changes
- Update `popup.js` for timer logic modifications
- Edit `background.js` for blocking behavior changes
- Customize `blocked.html` for block page appearance

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve HackFocus!

---

**Happy Hacking! 🚀**
