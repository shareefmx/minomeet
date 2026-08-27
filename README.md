<div align="center">

  # ⚡ Minomeet AI

  ### Autonomous On-Device & Cloud Meeting Intelligence & Minutes of Meeting (MOM) Assistant

  <p align="center">
    <a href="https://github.com/shareefmx/minomeet/releases"><img src="https://img.shields.io/github/v/release/shareefmx/minomeet?color=4f46e5&label=version&style=for-the-badge" alt="Release" /></a>
    <a href="https://github.com/shareefmx/minomeet/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react" alt="React 18" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.0-646cff.svg?style=for-the-badge&logo=vite" alt="Vite" /></a>
    <a href="https://ollama.com/"><img src="https://img.shields.io/badge/Ollama-Local_AI-black.svg?style=for-the-badge&logo=ollama" alt="Ollama" /></a>
    <a href="https://github.com/shareefmx/minomeet/stargazers"><img src="https://img.shields.io/github/stars/shareefmx/minomeet?style=for-the-badge&color=eab308" alt="Stars" /></a>
  </p>

  <p align="center">
    <b>Private, Multi-Source Audio Capture • Real-Time Speech-to-Text • Structured Minutes of Meeting (MOM) • Multi-Model AI Orchestration</b>
  </p>

  <p align="center">
    <a href="#-quickstart">Quickstart</a> •
    <a href="#-key-capabilities">Key Capabilities</a> •
    <a href="#-architecture--workflow">Architecture</a> •
    <a href="#-ai-model-control-panel">AI Control Panel</a> •
    <a href="#-exporting--email">Export & Email</a> •
    <a href="https://github.com/shareefmx/minomeet">GitHub Repo</a>
  </p>

  ---

</div>

<br />

## 🌟 Highlights

```
 ┌─────────────────┐     ┌──────────────────┐     ┌────────────────────────┐
 │ 🎙️ Dual Audio   │ ──► │ ⚡ Whisper Neural│ ──► │ 🤖 Multi-Model LLM     │ ──►  📄 Executive MOM
 │ (Mic + System)  │     │    Transcription │     │ (Ollama/Claude/GPT/...)│      + Action Matrix
 └─────────────────┘     └──────────────────┘     └────────────────────────┘
```

- 🛡️ **100% Privacy-First Architecture**: Audio streams, live transcripts, and embeddings stay strictly local on your machine.
- ⚡ **Multi-Source Audio Ingestion**: Record microphone audio, browser tabs, Google Meet, Zoom, Slack Huddles, or import `.mp3`, `.wav`, `.m4a`, `.webm` files.
- 🧠 **Dynamic AI Model Resolution**: Single source of truth for all AI tasks. Seamlessly switch between **Ollama (Local LLMs)**, **OpenAI (GPT-4o)**, **Anthropic (Claude 3.7 Sonnet)**, **Google Gemini 2.5**, **Groq**, and **OpenRouter**.
- 📋 **Executive MOM Generation**: Automatically generates structured Executive Summaries, Key Decisions, Discussion Highlights, Next Steps, and interactive Action Item matrices.
- 💬 **Ask Your Meetings AI**: Semantic natural-language Q&A assistant across your historical meeting archives.
- ✉️ **One-Click Follow-Up Emails**: Generates tailored email drafts in Professional, Concise, or Action-Oriented formats.
- 🔄 **Live GitHub Updates**: Direct built-in release verification connecting to [`shareefmx/minomeet`](https://github.com/shareefmx/minomeet).

---

## 🚀 Getting Started & First-Time Installation

Anyone running Minomeet on their local machine can set up the environment and on-device AI models with the following steps:

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm** / **pnpm** / **yarn**
- **Python**: `3.10+` *(Recommended for on-device neural transcription & speech processing)*
- *(Optional)* [Ollama](https://ollama.com/) for external local models.

### Step 1: Clone the Repository

```bash
git clone https://github.com/shareefmx/minomeet.git
cd minomeet
```

### Step 2: Install Node.js & Python Dependencies

```bash
# Install root, client, and server dependencies
npm install

# Install optional on-device neural speech & local processing packages
pip install -r requirements.txt
```

### Step 3: Run the Development Server

```bash
npm run dev
```

- **Frontend Application**: [`http://localhost:5173`](http://localhost:5173)
- **Backend API**: [`http://localhost:5001`](http://localhost:5001)

### Step 4: First-Time On-Device AI Model Setup (Qwen 3.5 4B)

When you launch Minomeet for the first time:
1. You will see the **"First-Time Setup: Download Qwen 3.5 4B"** banner on the Home Screen (or navigate to **Settings ➔ AI Model**).
2. Click **"Download & Install Model"** to download the on-device **Qwen 3.5 4B (2.6 GB)** neural model.
3. The weights are stored securely in `server/models/llm/` on your device.
4. Once installed, Minomeet performs **100% private, offline meeting intelligence, MOM summaries, action items extraction, and multi-meeting Q&A with zero cloud network calls**.

---

## 🎛️ AI Model Control Panel

Minomeet enforces **Dynamic Model Resolution** as the single source of truth across all AI agents:

```
Settings ──► AI Model ──► Provider ──► Model ──► Test Connection ──► Save ──► AI Agent ──► Synthesize
```

### Supported AI Providers

1. **Built-in / Local AI (Qwen 3.5 4B)**: Flagship on-device neural model. Zero cloud calls, 100% private and offline.
2. **Ollama (100% On-Device & Private)**:
   - Endpoint: `http://127.0.0.1:11434`
   - Supports: `llama3.3:70b`, `qwen2.5:7b`, `mistral:7b`, `deepseek-r1:8b`, `phi4:14b`
   - Real-time "Fetch Models" and "Test Connection" validation.
3. **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `o1`, `o3-mini`
4. **Anthropic Claude**: `claude-3-7-sonnet-latest`, `claude-3-5-sonnet-latest`, `claude-3-5-haiku-latest`
5. **Google Gemini**: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`
6. **Groq (Ultra High-Speed)**: `llama-3.3-70b-versatile`, `deepseek-r1-distill-llama-70b`
7. **OpenRouter**: Access any open-source or proprietary LLM with custom base URLs.

---

## 📂 Project Structure

```text
minomeet/
├── client/                     # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Titlebar, Sidebar, ToastHost
│   │   │   ├── modals/         # AboutModal, ImportAudio, AskMeetings, FollowUpEmail
│   │   │   └── screens/        # HomeScreen, RecordingScreen, NotesScreen, SettingsScreen
│   │   ├── context/            # MeetingContext (State management & Audio streaming)
│   │   ├── services/           # API Client & Export Handlers
│   │   ├── types/              # TypeScript Type Definitions
│   │   └── utils/              # AI Model Config & Formatters
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── routes/             # Meetings, AI, Audio, Settings, Templates
│   │   ├── services/           # AIService, AudioService, StorageService
│   │   ├── types/              # Server Type Definitions
│   │   ├── utils/              # Model Resolution & Robust AI JSON Parser
│   │   └── index.ts            # Server Entrypoint
│   ├── package.json
│   └── tsconfig.json
├── package.json                # Root Workspace Configuration
└── README.md                   # Project Documentation
```

---

## ⌨️ Keyboard Shortcuts & Controls

| Shortcut / Action | Action |
| :--- | :--- |
| `Click Record` | Start recording (Microphone, System audio, or Mixed) |
| `Click Stop` | Stop stream and automatically synthesize Minutes of Meeting |
| `Ask AI` | Launch the historical meeting semantic Q&A chatbot |
| `Export MOM` | Export notes to Markdown, Plain Text, or Print to PDF |
| `Email Draft` | Generate an instant email recap formatted with action deliverables |

---

## 🔒 Privacy & Security

- **Zero Cloud Recording**: Audio captures are recorded directly on your hardware.
- **Local Transcripts**: All speech-to-text outputs are stored in local JSON archives.
- **Local LLM Compatibility**: Use Ollama to ensure that zero meeting data ever leaves your computer.
- **No Third-Party Telemetry**: Zero external tracking scripts or telemetry data collection.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!

1. Fork the Project ([`https://github.com/shareefmx/minomeet`](https://github.com/shareefmx/minomeet))
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](file:///Users/muhammedshraeef/Documents/GitHub/minomeet/LICENSE) for more details.

---

<div align="center">
  <sub>Crafted with precision by <a href="https://github.com/shareefmx">@shareefmx</a></sub>
</div>
