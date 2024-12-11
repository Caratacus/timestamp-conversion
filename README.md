# Timestamp Converter

<div align="center">
  <img src="images/icon128.png" alt="Timestamp Converter Logo" width="128" height="128">
  <p>A sleek and efficient Chrome extension for converting timestamps with a macOS-style interface.</p>
</div>

## Features

- 🔄 Instant conversion of Unix timestamps (10-digit seconds and 13-digit milliseconds)
- 🌐 Timezone-aware conversions
- 🎯 Simple selection-based activation
- 💫 Elegant macOS-style popup interface
- ⚡️ Zero configuration required
- 🔍 Works on any webpage
- 🌍 Multi-language Support:
  - English
  - Français (French)
  - Deutsch (German)
  - Español (Spanish)
  - 简体中文 (Simplified Chinese)
  - 繁體中文 (Traditional Chinese)
  - 日本語 (Japanese)
  - 한국어 (Korean)
  - ไทย (Thai)

## Installation

1. Download from Chrome Web Store (Coming soon)

Or install manually:

1. Clone this repository
```bash
git clone https://github.com/yourusername/timestamp-conversion.git
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the cloned directory

## Usage

1. Select any Unix timestamp on a webpage (supports both 10-digit and 13-digit formats)
2. A conversion popup will instantly appear with:
   - Original timestamp
   - UTC time
   - Local time with timezone information

The popup will automatically close after a configurable delay (default: 5 seconds), and this timer pauses when you hover over the popup.

## Language Settings

The extension automatically detects your browser's language settings and displays content in your preferred language. You can manually switch between supported languages through the extension's popup interface.

### Supported Languages

- 🇺🇸 English
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇪🇸 Spanish (Español)
- 🇨🇳 Simplified Chinese (简体中文)
- 🇹🇼 Traditional Chinese (繁體中文)
- 🇯🇵 Japanese (日本語)
- 🇰🇷 Korean (한국어)
- 🇹🇭 Thai (ไทย)

## Screenshots

<div align="center">
  <img src="images/popup.png" alt="Popup Layer">
</div>

## Development

### Prerequisites
- Google Chrome
- Basic understanding of Chrome Extension development

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the need for quick timestamp conversions during development
- UI design inspired by macOS interface guidelines
