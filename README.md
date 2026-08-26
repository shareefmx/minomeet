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
- **Multer**: Multi-part audio file upload handling.
- **Local File Database (`data/db.json`)**: Lightweight, zero-setup local persistence.
- **CORS & Proxy Middleware**: Seamless local and containerized communication.

---

## Project Structure

```text
minomeet/
├── client/                     # Frontend React + TypeScript application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Modals, Titlebar, Sidebar, NotesScreen, RecordingScreen
│   │   ├── context/            # MeetingContext state management
│   │   ├── services/           # SpeechService, ApiService, ExportService
│   │   ├── types/              # TypeScript models & schemas
│   │   ├── App.tsx             # Root application component
│   │   ├── main.tsx            # React DOM entry point
│   │   └── index.css           # Tailwind CSS directives
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend Node.js + Express API
│   ├── data/                   # JSON storage persistence (db.json)
│   ├── uploads/                # Imported audio recordings
│   ├── src/
│   │   ├── data/               # Seed & default meeting records
│   │   ├── routes/             # Express route controllers (meetings, ai, settings)
│   │   ├── services/           # AIService, AudioService, StorageService
│   │   ├── types/              # Backend TypeScript definitions
│   │   └── index.ts            # Server entry point & route definitions
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example                # Example environment variables
├── .gitignore
├── generate_git_history.py     # Git development history generator
├── package.json                # Monorepo root scripts
└── README.md
```

---

## Requirements

Before running Minomeet, make sure you have:

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- A modern web browser (Google Chrome, Microsoft Edge, Brave, or Safari with Web Speech API support)
- Microphone & Screen Recording permissions enabled in your browser/OS

Check your environment:

```bash
node --version
npm --version
```

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shareefmx/minomeet.git
   cd minomeet
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
   *(This installs dependencies for the root orchestrator, `server`, and `client`.)*

---

## Environment Configuration

Create a `.env` file in the `server` directory (or use default configuration):

```bash
cp server/.env.example server/.env
```

Example `server/.env`:

```env
PORT=5001
NODE_ENV=development

# Optional AI API keys (Local engine is enabled by default)
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
OLLAMA_ENDPOINT=http://localhost:11434

STORAGE_PATH=./data
UPLOADS_PATH=./uploads
AUTO_DELETE_RECORDINGS_DAYS=30
```

---

## Running the Application

### 🚀 Start Development Servers (Recommended)

Run both the backend API server and frontend client concurrently:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Dashboard**: [http://localhost:5001](http://localhost:5001)
- **Backend Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

### Individual Service Commands

| Command | Description |
|---|---|
| `npm run server` | Start the backend Express server with `tsx watch` |
| `npm run client` | Start the frontend Vite dev server |
| `npm run build` | Compile TypeScript and build production assets for client & server |
| `npm run install:all` | Install all dependencies across root, server, and client |

---

## Meeting Recording Flow

```text
1. Select Source   ➔ [Microphone] or [System Audio / Tab] or [Mixed Audio]
2. Permissions     ➔ Grant browser media stream access
3. Live Recording  ➔ Waveform visualizer + live speech transcription
4. Conclude        ➔ Click "Stop Recording"
5. Auto-Process    ➔ Generates title, timestamps, and structured MOM
```

---

## AI MOM Generation & Intelligence

Minomeet transforms raw meeting transcripts into structured meeting notes:

```text
Raw Audio Transcript
        │
        ▼
   Clean & Segment
        │
        ├────────────────────────┬────────────────────────┐
        ▼                        ▼                        ▼
Executive Summary          Key Decisions            Action Items
(Context & Objectives)   (Agreements & Roadmaps)  (Owner, Due Date, Task)
```

### Supported Templates
- **Standard Meeting Notes**: General purpose business & team syncs.
- **Daily Standup**: Quick alignment, blockers, and today's commitments.
- **Project Sync / Status Update**: Milestone reviews, risks, and technical blockers.
- **Retrospective (Agile)**: What went well, what can improve, and action items.
- **Client / Sales Meeting**: Client requirements, timeline milestones, and delivery credentials.
- **Executive Board Brief**: High-level strategic overview and board decisions.

---

## MOM Structure

Generated meeting documents include:

| Section | Content Description |
|---|---|
| **Header & Meta** | Meeting title, date, duration, tags, and attendee list |
| **Executive Summary** | Concise paragraph capturing the core objective and outcomes |
| **Key Decisions** | Clear bulleted list of finalized technical and business agreements |
| **Action Items Matrix** | Table containing: **Owner**, **Task Description**, **Due Date**, **Context Notes**, and **Checkbox Status** |
| **Discussion Highlights** | Timestamped dialogue cues and important speaker remarks |
| **Next Steps** | Immediate follow-up priorities |

---

## MOM Editor & Exporting

- **Real-Time In-Place Editing**: Click any section (Summary, Decisions, Action Items) to edit text inline.
- **Interactive Checklists**: Toggle action item completion status; updates persist automatically to the local database.
- **Export Options**:
  - 📄 **Markdown (`.md`)**: Download formatted markdown for GitHub, Notion, or Obsidian.
  - 📑 **Plain Text (`.txt`)**: Clean text format for simple sharing.
  - 🖨️ **Printable PDF**: Formatted print preview with clean styling for distribution.
- **Follow-Up Email Drafts**: Select a tone (*Professional*, *Concise*, *Action-Oriented*) to instantly generate a ready-to-send email.

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
POST   /api/meetings/import  # Upload audio file for transcription
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
