# 📖 Manga Narrator - AI-Powered Manga Reader

<div align="center">

![Manga Narrator Banner](https://github.com/senpaisaul/manga-narrator/releases/download/v1.0.0/16X16.png)

**Transform your manga reading experience with AI-powered narration**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome)](https://github.com/yourusername/manga-narrator)
[![OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI-412991?logo=openai)](https://openai.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Demo Video](#demo) • [Features](#features) • [Installation](#installation) • [Usage](#usage)

</div>

---

## 🎬 Demo

<!-- Replace with your actual demo video -->
[Video Sample](https://github.com/senpaisaul/manga-narrator/releases/download/v1.0.0/Screen.Recording.2025-11-22.223129.mp4)

*Watch the Manga Narrator in action - capturing, analyzing, and narrating manga with human-like voices!*

### Screenshots

<div align="center">

| Extension | Settings Page | InAction

| ![Extension](https://github.com/senpaisaul/manga-narrator/releases/download/v1.0.0/Screenshot.2025-11-22.230642.png) | ![Settings](https://github.com/senpaisaul/manga-narrator/releases/download/v1.0.0/Screenshot.2025-11-22.230615.png) | ![InAction](https://github.com/senpaisaul/manga-narrator/releases/download/v1.0.0/Screenshot.2025-11-22.231544.png)]


</div>

---

## ✨ Features

### 🎭 **Human-Like AI Voices**
- **Gender-Aware Narration**: Automatically uses male voices for male characters and female voices for female characters
- **Emotional Expression**: Voice adjusts based on character emotions (excitement, sadness, anger, surprise)
- **OpenAI TTS HD**: Crystal-clear, natural-sounding voices that rival human narration

### 🤖 **Intelligent Manga Analysis**
- **GPT-4 Vision**: Advanced AI analyzes manga panels, characters, and dialogue
- **Panel Detection**: Automatically identifies reading order (supports right-to-left manga)
- **Character Recognition**: Detects character gender, emotions, and expressions
- **Dialogue Extraction**: Captures text exactly as written in the manga

### 🎮 **Easy to Use**
- **One-Click Start**: Simple popup interface with start/pause/stop controls
- **Screen Capture**: Works with any manga reader or website
- **Customizable**: Adjust capture interval, voice settings, and more
- **Real-Time Processing**: Continuous narration as you read

### 🔧 **Powerful Features**
- ⚡ Real-time screen capture every 10 seconds (configurable 3-30s)
- 🎯 Dialogue-only narration (no scene descriptions)
- 🔄 Smart redundancy detection (skips repeated content)
- 🎚️ Adjustable speech rate (0.5x - 2.0x)
- 💾 Settings persistence across sessions
- 🛡️ Privacy-focused (no permanent storage of captures)

---

## 📦 Installation

### Prerequisites
- Google Chrome (version 88+)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/manga-narrator.git
   cd manga-narrator
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `manga-narrator` directory

3. **Configure your API key**
   - Click the extension icon in your toolbar
   - Click "⚙️ Settings"
   - Enter your OpenAI API key
   - Click "Save Settings"

---

## 🚀 Usage

### Quick Start

1. **Open a manga page** in your browser
2. **Click the Manga Narrator icon** in your Chrome toolbar
3. **Click "Start Narration"**
4. **Select your screen/window** when prompted
5. **Enjoy the narration!** 🎧

### Controls

- **▶️ Start**: Begin screen capture and narration
- **⏸️ Pause**: Pause audio playback (capture continues)
- **▶️ Resume**: Resume audio from where you paused
- **⏹️ Stop**: Stop everything and release resources

### Settings

Access settings by clicking the ⚙️ button in the popup:

| Setting | Description | Default |
|---------|-------------|---------|
| **API Key** | Your OpenAI API key | Required |
| **Voice** | Preferred TTS voice | Auto (gender-based) |
| **Speech Rate** | Narration speed | 1.0x |
| **Capture Interval** | Time between captures | 10 seconds |

---

## 🎭 Voice Selection

The extension automatically selects voices based on character gender:

| Character | Voice | Description |
|-----------|-------|-------------|
| 👨 Male | Onyx | Deep, masculine voice |
| 👩 Female | Shimmer | Soft, feminine voice |
| ❓ Unknown | Nova | Neutral, warm voice |

Emotions automatically adjust:
- 😊 **Excitement**: Faster pace, higher energy
- 😢 **Sadness**: Slower pace, softer tone
- 😠 **Anger**: Forceful delivery
- 😲 **Surprise**: Quick, elevated pitch
- 🤫 **Whisper**: Quiet, intimate tone

---

## 💰 Cost Estimate

Using OpenAI APIs:
- **GPT-4 Vision**: ~$0.01 per manga page
- **TTS HD**: ~$0.03 per 1000 characters
- **Average cost**: ~$0.02-0.05 per page

*Costs may vary based on manga complexity and dialogue length*

---

## 🐛 Troubleshooting

### Common Issues

**Screen capture not working?**
- Reload the webpage and extension
- Make sure you selected a screen/window to share
- Check that you're not on a restricted page (chrome://, etc.)

**No audio playing?**
- Verify your OpenAI API key is configured
- Check your system volume
- Ensure you have API credits available

**API errors?**
- Confirm your API key starts with `sk-`
- Check your OpenAI account has credits
- Verify internet connection

For more help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📝 License

MIT License

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 Vision and TTS APIs
- **Chrome Extensions** team for the platform
- **Manga community** for inspiration

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ and 🤖 AI

</div>
