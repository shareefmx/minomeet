<div align="center">

  # ⚡ Minomeet AI

  ### Autonomous On-Device & Cloud Meeting Intelligence • Minutes of Meeting (MOM) Assistant

  <p align="center">
    <a href="https://github.com/shareefmx/minomeet/releases"><img src="https://img.shields.io/github/v/release/shareefmx/minomeet?color=4f46e5&label=version&style=for-the-badge" alt="Release" /></a>
    <a href="https://github.com/shareefmx/minomeet/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react" alt="React 18" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.0-646cff.svg?style=for-the-badge&logo=vite" alt="Vite" /></a>
    <a href="https://ollama.com/"><img src="https://img.shields.io/badge/Ollama-Local_AI-black.svg?style=for-the-badge&logo=ollama" alt="Ollama" /></a>
    <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Ready" /></a>
    <a href="https://github.com/shareefmx/minomeet/stargazers"><img src="https://img.shields.io/github/stars/shareefmx/minomeet?style=for-the-badge&color=eab308" alt="Stars" /></a>
  </p>

  <p align="center">
    <b>Private, Multi-Source Audio Capture • Real-Time Speech-to-Text • Structured Minutes of Meeting (MOM) • Multi-Model AI Orchestration</b>
  </p>

  <p align="center">
    <a href="#-video-demo">📺 Video Demo</a> •
    <a href="#-quickstart--everyday-usage">🚀 Quickstart</a> •
    <a href="#-docker-deployment">🐳 Docker</a> •
    <a href="#-key-capabilities">✨ Key Capabilities</a> •
    <a href="#-ai-model-control-panel">🎛️ AI Control Panel</a> •
    <a href="#-how-you-can-support">❤️ Support</a> •
    <a href="https://github.com/shareefmx/minomeet/issues">🐛 Issues</a>
  </p>

  ---

</div>

<br />

## 📺 Video Demo & Product Walkthrough

Check out the full product walkthrough and see Minomeet AI in action:

<div align="center">
  <a href="https://youtu.be/2RuGooHVJUE?si=c4jjRI49N232XsHz" target="_blank">
    <img src="https://img.youtube.com/vi/2RuGooHVJUE/maxresdefault.jpg" alt="Minomeet AI Video Demo" width="750" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);" />
  </a>
  <p align="center">
    👉 <b>Watch on YouTube:</b> <a href="https://youtu.be/2RuGooHVJUE?si=c4jjRI49N232XsHz"><b>https://youtu.be/2RuGooHVJUE</b></a>
  </p>
</div>

---

## 🌟 Highlights

```
 ┌─────────────────┐     ┌──────────────────┐     ┌────────────────────────┐
 │ 🎙️ Dual Audio   │ ──► │ ⚡ Whisper Neural│ ──► │ 🤖 Multi-Model LLM     │ ──►  📄 Executive MOM
 │ (Mic + System)  │     │    Transcription │     │ (Ollama/Claude/GPT/...)│      + Action Matrix
 └─────────────────┘     └──────────────────┘     └────────────────────────┘
```

- 🛡️ **100% Privacy-First Architecture**: Audio streams, live transcripts, and embeddings stay strictly local on your machine.
- ⚡ **Multi-Source Audio Ingestion**: Record microphone audio, browser tabs, Google Meet, Zoom, Slack Huddles, or import `.mp3`, `.wav`, `.m4a`, `.webm` files.
- 🧠 **Dynamic Multi-Model AI**: Seamlessly connect **Ollama (Local LLMs)**, **OpenAI (GPT-4o)**, **Anthropic (Claude 3.7 Sonnet)**, **Google Gemini 2.5**, **Groq**, and **Custom OpenAI-Compatible Servers** (LM Studio, vLLM, DeepSeek, Together AI).
- 📋 **Executive MOM Generation**: Automatically generates structured Executive Summaries, Key Decisions, Discussion Highlights, Next Steps, and interactive Action Item matrices.
- 💬 **Ask Your Meetings AI**: Semantic natural-language Q&A assistant across your historical meeting archives.
- ✉️ **One-Click Follow-Up Emails**: Generates tailored email drafts in Professional, Concise, or Action-Oriented formats.
- 💻 **Global Terminal CLI (`minomeet`)**: Launch casually anytime directly from your terminal by typing `minomeet` and pressing `o` to open the app window.

---

## 🚀 Quickstart & Everyday Usage

The repository is completely open-source and ready to run locally in under 2 minutes:
👉 **GitHub Repository**: [https://github.com/shareefmx/minomeet](https://github.com/shareefmx/minomeet)

### 📋 Prerequisites

| Requirement | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v18.0.0+` (`v20+` LTS recommended) | Web app and backend server runtime |
| **Python** | `3.10+` *(Recommended)* | On-device Whisper STT & neural speech decoding |
| **FFmpeg** | `4.0+` *(Recommended)* | High-fidelity multi-format audio processing |
| **AI Key / Server** | Gemini, OpenAI, Claude, Groq, or Ollama | MOM summaries, action matrices & Q&A |

---

### 📥 1. One-Time Setup

```bash
# Step 1: Clone the repository
git clone https://github.com/shareefmx/minomeet.git
cd minomeet

# Step 2: Install Node.js workspace dependencies
npm install

# Step 3: Install Python requirements for on-device Whisper STT & neural transcription
pip install -r requirements.txt

# Step 4: Register global CLI command (Run once)
npm link
```

> **💡 Optional System Dependency (FFmpeg)**:  
> - **macOS**: `brew install ffmpeg`  
> - **Ubuntu / Debian**: `sudo apt install ffmpeg`  
> - **Windows**: `winget install Gyan.FFmpeg` or `choco install ffmpeg`

---

### ☕ 2. Everyday Casual Launch

Once setup is complete, you can launch Minomeet casually at any time from **any directory** in your terminal:

```bash
minomeet
```

```
   __  __ _                            _   
  |  \/  (_)_ __   ___  _ __ ___   ___  ___| |_ 
  | |\/| | | '_ \ / _ \| '_ ` _ \ / _ \/ _ \ __|
  | |  | | | | | | (_) | | | | | |  __/  __/ |_ 
  |_|  |_|_|_| |_|\___/|_| |_| |_|\___|\___|\__|

  Autonomous On-Device & Cloud AI Meeting Intelligence (v1.2.0)
  -----------------------------------------------------------------
  ➜  Web Application:  http://localhost:5173
  ➜  Backend API:      http://localhost:5001
  ➜  Environment:      100% Privacy-First On-Device
  -----------------------------------------------------------------
  Interactive Shortcuts:
  [o]  Open Minomeet in browser window
  [c]  Clear terminal screen
  [q]  Quit Minomeet (or press Ctrl+C)
  -----------------------------------------------------------------
```

#### ⌨️ Terminal Interactive Shortcuts:
- **Press `o`**: Instantly launches your default browser and opens Minomeet (`http://localhost:5173`).
- **Press `c`**: Clears the console.
- **Press `q`** (or `Ctrl+C`): Gracefully stops all Minomeet services.

*(Alternatively, you can also start via `npm start` or `npm run dev`)*.

---

## 🐳 Docker Deployment

Run Minomeet anywhere with zero manual dependencies using Docker and Docker Compose:

### ⚡ 1-Command Startup with Docker Compose
```bash
# Clone the repository
git clone https://github.com/shareefmx/minomeet.git
cd minomeet

# Start Minomeet container in the background
docker compose up -d
```

Open your browser and visit:  
👉 **`http://localhost:5001`**

```bash
# View live container logs
docker compose logs -f

# Stop the container
docker compose down
```

---

### 📦 Standalone Docker Commands

```bash
# 1. Build the production Docker image
docker build -t minomeet .

# 2. Run container with persistent data volumes
docker run -d \
  --name minomeet \
  -p 5001:5001 \
  -v minomeet_data:/app/server/data \
  -v minomeet_uploads:/app/server/uploads \
  minomeet
```

> **🛡️ Persistent Meeting Data**: Meeting notes, audio archives, and settings are preserved across container updates and restarts inside the `minomeet_data` and `minomeet_uploads` Docker volumes.

---

## 🎛️ AI Model Control Panel

Minomeet connects directly to frontier AI providers or local self-hosted inference servers:

```
Settings ──► AI Model ──► Provider ──► Model ──► Test Connection ──► Save ──► AI Agent
```

### Supported AI Providers & Engines

| Provider | Supported Models | Mode |
| :--- | :--- | :--- |
| **Google Gemini** | `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-1.5-pro` | Cloud API |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o3-mini`, `gpt-4-turbo` | Cloud API |
| **Anthropic Claude** | `claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-5-haiku` | Cloud API |
| **Groq (LPUs)** | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b` | Ultra-Fast Cloud |
| **Ollama (Self-Hosted)** | `llama3.3:70b`, `qwen2.5:7b`, `deepseek-r1:8b`, `mistral:7b` | 100% Offline Local |
| **Custom OpenAI Server** | LM Studio, vLLM, DeepSeek, Together AI, LiteLLM | Auto Model Discovery |

> **💡 Custom OpenAI Server Auto-Discovery**: Enter your custom endpoint URL & API key, then click **"Fetch Models"** — Minomeet automatically retrieves all models running on your server and populates a dynamic selection dropdown.

---

## 📂 Project Structure

```text
minomeet/
├── bin/                        # Global CLI Executable ('minomeet')
│   └── minomeet.js             # Terminal interactive runner with 'o' browser launcher
├── client/                     # React 18 + Vite 6 Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Titlebar, Sidebar, ToastHost
│   │   │   ├── modals/         # AboutModal, ImportAudio, AskMeetings, FollowUpEmail
│   │   │   └── screens/        # HomeScreen, RecordingScreen, NotesScreen, SettingsScreen
│   │   ├── context/            # MeetingContext (State management & Audio streaming)
│   │   ├── services/           # API Client & Export Handlers
│   │   ├── types/              # TypeScript Type Definitions
│   │   └── utils/              # AI Model Config & Robust JSON Formatters
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── routes/             # Meetings, AI, Audio, Settings, Templates
│   │   ├── services/           # AIService, AudioService, StorageService
│   │   ├── types/              # Server Type Definitions
│   │   ├── utils/              # Model Resolution & Robust AI JSON Parser
│   │   └── index.ts            # Server Entrypoint (Port 5001)
│   ├── package.json
│   └── tsconfig.json
├── package.json                # Root Workspace Configuration & CLI 'bin'
└── README.md                   # Project Documentation
```

---

## ⌨️ Application Controls & Shortcuts

| Action / Shortcut | Function |
| :--- | :--- |
| **`minomeet`** | Global terminal command to start services |
| **`Press 'o'`** | Open web app in default browser |
| **`Start Live Recording`** | Capture dual-channel audio (Mic + Meeting participants) |
| **`Import Recording`** | Upload `.mp3`, `.wav`, `.m4a`, `.mp4`, `.mov`, `.mkv`, `.webm` for local transcription |
| **`Ask Your Meetings`** | Launch semantic multi-meeting Q&A search assistant |
| **`Export MOM`** | Export notes to Markdown, Plain Text, or formatted PDF |
| **`Email Recap`** | Generate 1-click tailored email drafts with action items |

---

## 📜 Release Notes & Version History

<details>
<summary><b>Click to expand full version release history & changelog table (v0.1.0 – v1.2.2)</b></summary>
<br />

| Version | Release Stage | Type | Highlights & Key Capabilities |
| :--- | :--- | :--- | :--- |
| **`v1.2.2`** | 🌟 **Current Stable** | `Minor` | **Video & Audio Recording Ingestion**: Support for `.mp4`, `.mov`, `.mkv`, `.avi`, `.webm` with automatic FFmpeg background audio stream extraction, 500MB upload capacity, dynamic media badges & pipeline animation. |
| **`v1.2.1`** | ⚡ Stable Patch | `Patch` | **Single-Port Production Routing**: Unified Express SPA static file serving on port `5001`, auto-detecting WebSocket protocol (`ws://` vs `wss://`) and ports for zero-config Docker containerization. |
| **`v1.2.0`** | 🐳 Major Milestone | `Minor` | **Global Terminal CLI & Docker Deployment**: Interactive binary runner `minomeet` with `o` key launch, production `Dockerfile`, and `docker-compose.yml` with persistent storage volumes (`minomeet_data`, `minomeet_uploads`). |
| **`v1.1.2`** | 🔒 Privacy Release | `Patch` | **Local LLM & Offline Inference**: DeepSeek-R1, Llama 3.3, and Qwen 2.5 support via native Ollama; self-healing JSON schema parser ensuring zero hallucination in generated MOM items. |
| **`v1.1.1`** | 🛡️ Security Patch | `Patch` | **Subprocess & Input Hardening**: Replaced shell invocations with `execFile` array arguments, strict MIME/audio extension validation, and HTTP security response headers. |
| **`v1.1.0`** | 🧠 AI Expansion | `Minor` | **Multi-Model Provider Hub & Onboarding Tour**: Added Claude 3.7 Sonnet, GPT-4o, Gemini 2.5, Groq LPUs, custom vLLM auto-discovery, and 5-step interactive onboarding walkthrough. |
| **`v1.0.0`** | 🎉 **SaaS Launch** | `Major` | **Official Production Architecture Launch**: Full-stack React 18 + Node.js Express + TypeScript monorepo, zero-bot audio capture, real-time Whisper STT, Executive MOM, Decision Matrix, Action Items, 1-Click Email Drafter. |
| **`v0.8.0`** | 📋 Beta Release | `Beta` | **Export Suite & Semantic Memory**: Multi-format exports (Markdown, Plain Text, Printable PDF), fast keyword search, tag filtering, and JSON database persistence. |
| **`v0.5.0`** | 🔬 Alpha Prototype | `Alpha` | **Dual-Channel Audio Pipeline**: Web Audio API dual-channel loopback mixing (mic + tab audio), low-latency WebSocket streaming, and interactive dialogue timeline. |
| **`v0.2.0`** | ⚡ Pre-Alpha | `Pre-Alpha` | **Speech-to-Text & Prompt Prototyping**: Local Whisper model benchmarking, speaker diarization tests, multi-shot structured summary prompting. |
| **`v0.1.0`** | 🐣 Inception | `Inception` | **Core Concept Validation**: Project kickoff, browser audio capture experimentation, and feasibility testing for zero-bot meeting intelligence. |

</details>

---

## 🔒 Privacy & Security

- **Zero Third-Party Telemetry**: Conversations, audio streams, and generated notes are processed and stored locally on your machine.
- **Local Storage**: All recordings and meeting history are archived in local JSON databases.
- **Local LLM Compatibility**: Full support for Ollama and local OpenAI-compatible endpoints so zero meeting data ever leaves your computer.

---

## 💬 Community, Feedback & Issues

If you run into any bugs, have feature requests, or want to suggest improvements:
👉 **Open an Issue on GitHub**: [https://github.com/shareefmx/minomeet/issues](https://github.com/shareefmx/minomeet/issues)

---

## ❤️ How You Can Support

If you find Minomeet useful for your workflow and meetings, here are a few great ways to support the project:

1. **🚀 Give it a try**: Run it for your next meeting or conference call and let me know your thoughts, feature requests, or feedback!
2. **⭐ Star the repository**: Dropping a ⭐ on [**`shareefmx/minomeet`**](https://github.com/shareefmx/minomeet) helps boost visibility and reach more open-source builders.
3. **👀 Follow on GitHub**: Follow [@shareefmx](https://github.com/shareefmx) to stay updated on new releases, tools, and local AI projects.
4. **💖 Sponsor on GitHub**: If you'd like to support ongoing development and local AI research, consider sponsoring the project directly via [**GitHub Sponsors**](https://github.com/sponsors/shareefmx).

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

Developed by [@shareefmx](https://github.com/shareefmx).
