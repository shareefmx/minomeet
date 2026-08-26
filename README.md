# Minomeet — AI Meeting Recorder & Minutes of Meeting Assistant

Minomeet is a modern, privacy-first AI-powered meeting assistant built with React, TypeScript, and Node.js. It captures microphone and system audio, provides real-time live transcription, and automatically synthesizes structured Executive Summaries, Key Decisions, Action Item matrices, and follow-up emails.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Application Flow](#application-flow)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Meeting Recording Flow](#meeting-recording-flow)
- [AI MOM Generation & Intelligence](#ai-mom-generation--intelligence)
- [MOM Structure](#mom-structure)
- [MOM Editor & Exporting](#mom-editor--exporting)
- [API Overview](#api-overview)
- [Data Storage Overview](#data-storage-overview)
- [Audio & Browser Permissions](#audio--browser-permissions)
- [Privacy & Security](#privacy--security)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

---

## Overview

Documenting meeting discussions, recording action items, and drafting follow-up emails manually is time-consuming and error-prone. **Minomeet** streamlines the entire lifecycle of meeting notes with minimal manual effort.

### What Minomeet Does:

1. **Captures Multi-Source Audio**: Supports Microphone, System/Tab Audio, or Mixed dual-stream capture.
2. **Streams Live Transcription**: Displays timestamped speaker-tagged transcripts in real time.
3. **Generates Structured Minutes (MOM)**: Synthesizes Executive Summaries, Key Decisions, and Action Items.
4. **Interactive MOM Editor**: Allows complete in-place editing of generated notes, attendees, and action checklists.
5. **Cross-Meeting Intelligence**: Features an **"Ask Your Meetings"** semantic search engine across historical archives.
6. **One-Click Follow-Up Emails**: Generates tailored email drafts based on decisions and action item ownership.
7. **Multiple Export Formats**: Exports meeting minutes directly to Markdown, Plain Text, or Printable PDF.

### Main Goal

> Transform live conversations and recorded audio into structured, actionable, and searchable Minutes of Meeting with zero friction.

---

## Key Features

### 🎙️ Audio Recording & Capture
- **Microphone Capture**: Standard desktop or headset input via Web Audio APIs.
- **System Audio Capture**: Capture computer audio from Google Meet, Zoom, Microsoft Teams, or browser tabs.
- **Mixed Audio Stream**: Combine local mic and incoming remote audio into a unified transcript stream.
- **Recording Controls**: Start, stop, cancel, and live duration timer with dynamic audio waveform visualizations.

### 📝 Live Transcription
- Real-time speech-to-text with timestamped segments.
- Automatic speaker differentiation and clean formatting.
- Searchable transcript viewer alongside generated meeting notes.

### 🤖 AI Meeting Intelligence
- **Executive Summary**: High-level synthesis of discussion highlights.
- **Key Decisions**: Clear bulleted list of approved decisions and roadmap alignments.
- **Action Items Matrix**: Assignee, task description, due dates, context notes, and completion toggles.
- **Multi-Template Support**: Standard Notes, Daily Standup, Project Sync, Agile Retro, Client/Sales Meeting, Executive Brief.
- **Multi-Language Generation**: English, Spanish, French, German, Hindi, and Malayalam.
- **Ask Your Meetings (Semantic Q&A)**: Ask natural language questions across all past meeting transcripts.
- **Automated Follow-Up Emails**: Generate email recaps in Professional, Concise, or Action-Oriented tones.

### ✏️ Interactive MOM Editor & Library
- Edit titles, dates, attendees, executive summaries, decisions, and action items in real time.
- Search meeting history with instant title, tag, and transcript filtering.
- Rename and delete meetings with safe confirmation prompts.
- Audio file import (`.mp3`, `.wav`, `.m4a`, `.webm`) with automated transcription.

---

## Application Flow

```text
┌─────────────────────────┐
│          User           │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Select Audio Source     │
│ (Mic / System / Mixed)  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Live Audio Capture &    │
│ Real-Time Transcription │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Conclude Meeting        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ AI MOM Synthesis        │
│ (Summary, Action Items) │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Review, Edit & Assign   │
└────────────┬────────────┘
             │
             ├──────────────────────────┐
             ▼                          ▼
┌─────────────────────────┐   ┌───────────────────┐
│ Export (MD / PDF / TXT) │   │ Draft Follow-Up   │
└─────────────────────────┘   │ Email / Q&A Search│
                              └───────────────────┘
```

---

## System Architecture

Minomeet adopts a clean client-server architecture with proxy routing for development and production:

```text
                     ┌───────────────────────┐
                     │         User          │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ React + Vite (Client) │
                     │   http://localhost:5173│
                     └───────────┬───────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  ▼                             ▼
        ┌───────────────────┐         ┌───────────────────┐
        │  Web Audio / Mic  │         │  MOM Editor & UI  │
        │  Speech-to-Text   │         │  Meeting Context  │
        └─────────┬─────────┘         └─────────┬─────────┘
                  │                             │
                  └──────────────┬──────────────┘
                                 │ HTTP / JSON Proxy
                                 ▼
                     ┌───────────────────────┐
                     │ Node.js Express (API) │
                     │   http://localhost:5001│
                     └───────────┬───────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
     ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
     │ AI Service  │      │ Audio Parser│      │ Local JSON  │
     │ MOM / Q&A   │      │ & Multer    │      │ Storage DB  │
     └─────────────┘      └─────────────┘      └─────────────┘
```

---

## Technology Stack

### Frontend (`client/`)
- **React 18**: Modern component architecture with hooks and state management.
- **TypeScript**: Complete type safety for meeting models and API payloads.
- **Vite 6**: Blazing fast development server and optimized production bundler.
- **Tailwind CSS**: Responsive, dark-mode modern user interface.
- **Lucide React**: Clean and consistent icon set.
- **Web Audio & MediaStream APIs**: Multi-channel audio recording and waveform visualization.

### Backend (`server/`)
- **Node.js & Express**: High-performance RESTful API service.
- **TypeScript & TSX**: Type-safe development with live reload.
- **Python 3 & OpenAI Whisper**: On-device speech recognition engine (`whisper.load_model('turbo')`, `large-v3`, `medium`, `small`, `base`, `tiny`).
- **NVIDIA / Fast STT**: Parakeet TDT Lightning (sub-50ms streaming latency architecture).
- **Multer**: Multi-part audio file upload handling.
- **Local File Database (`data/db.json`)**: Lightweight, zero-setup local persistence.
- **CORS & Proxy Middleware**: Seamless local and containerized communication.

---

## Transcription Model Catalog

Minomeet includes an offline model manager supporting both high-accuracy transformer models and low-latency streaming models:

| Model | Family | Size | Decoding Speed | Recommended Use Case |
|---|---|---|---|---|
| **Whisper Large-v3 Turbo** | Whisper | 1.5 GB | 8x Real-Time | ★ **Recommended Default** — Top accuracy with ultra-fast inference |
| **Whisper Large-v3** | Whisper | 3.1 GB | 2x Real-Time | Studio-grade accuracy across 99+ languages |
| **Whisper Large-v3 Compressed (INT8)** | Whisper | 1.5 GB | 5x Real-Time | Quantized weights for memory-constrained machines |
| **Whisper Medium** | Whisper | 1.5 GB | 4x Real-Time | Balanced multi-speaker meetings and conferences |
| **Whisper Small** | Whisper | 461 MB | 6x Real-Time | Quick standups and standard 1-on-1 calls |
| **Whisper Base** | Whisper | 142 MB | 10x Real-Time | Lightweight, low memory footprint |
| **Whisper Tiny** | Whisper | 75 MB | 16x Real-Time | Ultra-lightweight rapid transcription |
| **Parakeet TDT 1.1B Lightning** | Parakeet | 620 MB | Real-Time (<50ms) | ★ **Recommended Streaming** — Instant live captions with sub-50ms latency |
| **Parakeet Compact 0.6B** | Parakeet | 290 MB | Real-Time (<30ms) | Ultra-low latency for constrained hardware |

---

## Python AI Engine & Setup

Minomeet can utilize local Python-based Whisper for offline audio file transcription:

```bash
cd server
pip3 install -r requirements.txt
```

### Python Dependencies (`server/requirements.txt`):
- `openai-whisper>=20231117`
- `torch>=2.0.0`
- `torchaudio>=2.0.0`
- `numpy>=1.24.0`
- `soundfile>=0.12.1`
- `ffmpeg-python>=0.2.0`

---

## API Overview

The Minomeet backend exposes a comprehensive RESTful API:

### 📋 Meetings API

```http
GET    /api/meetings         # List all meetings (supports ?search= query)
GET    /api/meetings/:id     # Retrieve single meeting details & transcript
POST   /api/meetings         # Create a new meeting
PUT    /api/meetings/:id     # Update meeting details, summary, or action items
DELETE /api/meetings/:id     # Delete meeting permanently
POST   /api/meetings/import  # Upload audio file & transcribe with selected Whisper model
```

### 🎙️ Transcription & Model Management API

```http
GET    /api/transcription/models             # List all available Whisper & Parakeet models
POST   /api/transcription/models/:id/download # Download model weights to local disk
DELETE /api/transcription/models/:id          # Delete / offload local model weights
POST   /api/transcription/models/:id/select   # Set active transcription engine
GET    /api/transcription/status             # Check Python, Whisper, PyTorch & FFmpeg status
POST   /api/transcription/install-packages   # 1-Click pip package installer
```

### 🧠 AI & Intelligence API

```http
POST   /api/ai/summarize        # Generate / regenerate MOM summary from transcript
POST   /api/ai/ask              # Semantic Q&A search across meeting history
POST   /api/ai/follow-up-email  # Generate professional follow-up email draft
```

### ⚙️ Settings & System API

```http
GET    /                 # Backend status & API route dashboard
GET    /api/health       # Server health check endpoint
GET    /api/settings     # Retrieve application settings
PUT    /api/settings     # Update application settings
```

---

## Data Storage Overview

Minomeet uses a local JSON-based storage engine:

- **Storage Location**: `server/data/db.json`
- **Audio Uploads**: `server/uploads/`
- **Zero Configuration**: No external database setup (PostgreSQL, MongoDB) required for local usage.
- **Portability**: All data stays on your local machine for complete privacy.

---

## Audio & Browser Permissions

When recording in Minomeet, the browser will request:

1. **Microphone Access**: Required to record your local microphone audio.
2. **Tab / Screen Audio Access**: When choosing *System Audio* or *Mixed Audio*, the browser prompts to share a tab or screen audio stream.
   > **Tip**: In Chrome/Edge, select **Chrome Tab** or **Entire Screen** and make sure the **"Share tab audio"** / **"Also share system audio"** checkbox is enabled.

---

## Privacy & Security

- 🔒 **Local-First Processing**: Meeting transcripts and database records are stored locally on your machine.
- 🚫 **No Unsolicited Cloud Uploads**: Audio streams and notes remain private and are not shared with external trackers.
- 🗑️ **Full User Control**: You can delete meetings, clear transcripts, or edit action items permanently at any time.

---

## Troubleshooting

### Port 5001 or 5173 is already in use
If another process is occupying the ports, free them with:
```bash
lsof -ti :5001 -ti :5173 | xargs kill -9
```

### Microphone is not capturing sound
1. Verify browser microphone permissions in `chrome://settings/content/microphone` or equivalent.
2. Ensure the correct microphone input is selected in your Operating System settings.

### System audio capture is silent
1. When sharing your screen/tab, verify that the **"Share Audio"** toggle was checked in the browser sharing popup.
2. Note that macOS requires sharing a specific browser tab or window that produces audio.

---

## Roadmap

- [x] Multi-source audio capture (Mic, System, Mixed)
- [x] Real-time live speech-to-text transcription
- [x] Automated AI MOM summary & action item extraction
- [x] Inline editable MOM editor with action item toggles
- [x] Multi-template and multi-language support
- [x] Cross-meeting semantic Q&A ("Ask Your Meetings")
- [x] Follow-up email draft generator
- [x] Markdown, Plain Text, and Printable PDF export
- [ ] Speaker diarization and voiceprint identification
- [ ] Local offline Whisper STT model integration
- [ ] Google Calendar & Outlook meeting synchronization
- [ ] Automated Slack / Microsoft Teams webhook sharing

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the **MIT License**. See [`LICENSE`](file:///Users/muhammedshraeef/Documents/GitHub/minomeet/LICENSE) for more information.

---

## Disclaimer

Minomeet is a meeting productivity assistant. Users are responsible for complying with applicable regional wiretapping, privacy laws, and obtaining participant consent prior to recording any meeting.
