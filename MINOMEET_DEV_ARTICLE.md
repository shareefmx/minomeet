---
title: ⚡ Meet Minomeet: The Zero-Bot, 100% Private AI Meeting Copilot (Built with React & Node.js)
published: true
tags: ai, opensource, webdev, react
canonical_url: https://github.com/shareefmx/minomeet
cover_image: https://raw.githubusercontent.com/shareefmx/minomeet/main/client/public/branding/logo-full-dark.jpg
---

# ⚡ Meet Minomeet: The Zero-Bot, 100% Private AI Meeting Copilot

Every day, knowledge workers, engineering teams, and sales reps spend hours hopping between standups, sprint reviews, client demos, and strategy syncs.

Then comes the real productivity killer: **post-meeting administrative work.**

Someone on the team gets stuck spending **30 to 50 minutes** reviewing messy notes, drafting the Minutes of Meeting (MOM), assigning action items, and emailing follow-up recaps to stakeholders. Multiply that by 5–10 meetings a week, and hundreds of engineering and revenue hours evaporate into note-taking friction.

To fix this, I built [**Minomeet AI**](https://github.com/shareefmx/minomeet) — an open-source, autonomous meeting intelligence copilot that turns long conversations into **structured Executive Summaries, Key Decision matrices, Action Items, and follow-up emails in 2–5 minutes — with 100% privacy and zero awkward meeting bots.**

---

## 🚫 The Problem With Existing AI Notetakers: "The Meeting Bot"

Most AI notetakers on the market (Otter.ai, Fireflies.ai, Fathom) rely on a flawed architecture: **they force an external cloud bot to join your calendar invite.**

```
❌ The Old Way:
Client Call ──► External Bot Joins ──► Audio Beamed to 3rd-Party Cloud ──► Privacy Risk & Bot Rejection
```

This creates three major headaches:
1. **Client & Team Resistance:** Clients frequently object to third-party bots recording confidential sales or strategy calls (*"Who is Otter.ai Notetaker and why are they in our private meeting?"*).
2. **Enterprise IT & Compliance Blockers:** Regulated industries (Fintech, Healthcare, Legal, Defense) are legally forbidden from transmitting private voice streams to third-party SaaS clouds.
3. **Bot Rejections & Firewalls:** Many corporate Zoom and Google Meet rooms automatically reject external bot attendees.

---

## 💡 The Minomeet Solution: How It Works

**Minomeet** eliminates the need for meeting bots entirely by using **native Dual-Channel Audio Ingestion** directly on your machine.

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────────┐
│ 🎙️ Dual Audio   │ ──► │ ⚡ Whisper Neural│ ──► │ 🤖 Multi-Model LLM     │ ──►  📄 Executive MOM
│ (Mic + System)  │     │    Transcription │     │ (Ollama/Claude/GPT/...)│      + Action Matrix
└─────────────────┘     └──────────────────┘     └────────────────────────┘
```

1. **Zero-Bot Audio Capture:** Ingests your microphone + system audio (Google Meet, Zoom, MS Teams, Slack Huddles, or browser tabs) directly via the Web Audio API without calendar invites.
2. **Real-Time Neural Speech Diarization:** Transcribes who said what in real time using local Whisper models.
3. **Structured Executive MOM in 2–5 Minutes:** Instead of dumping an unorganized text wall, it structures the discussion into:
   - 🎯 **Executive Summary:** High-level strategic overview.
   - ⚖️ **Key Decisions Matrix:** Concrete agreements made during the meeting with context.
   - ✅ **Action Items & Deliverables:** Assigns tasks to owners with context and target deadlines.
4. **💬 "Ask Your Meetings" AI:** A semantic natural-language Q&A assistant that lets you query your historical meeting archives (*"What was the agreed budget for the cloud migration last Tuesday?"*).
5. **✉️ 1-Click Follow-Up Email Generator:** Instantly crafts professional, concise, or action-oriented recap emails ready to send.
6. **🛡️ 100% Privacy-First & Local SLMs:** Fully compatible with **Ollama (Llama 3.3, DeepSeek-R1, Qwen 2.5)** and local vLLM/LM Studio servers, guaranteeing that **zero audio or transcript data ever leaves your computer.**

---

## 🛠️ The Tech Stack Behind Minomeet

Minomeet was engineered from the ground up as a unified, full-stack TypeScript application:

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite 6
- **Backend API:** Node.js, Express, WebSocket streaming (`ws`), TypeScript
- **Speech Engine:** OpenAI Whisper Neural STT, Web Audio API, FFmpeg
- **Multi-Model Orchestration:** Google Gemini 2.5, Anthropic Claude 3.7 Sonnet, OpenAI GPT-4o, Groq LPUs, and Ollama (Local SLMs) with self-healing JSON schema validation
- **Packaging & Deployment:** Global Terminal CLI (`bin/minomeet.js`), Docker & Docker Compose

---

## 📺 Product Walkthrough in Action

Check out the full walkthrough video of Minomeet in action:

{% embed https://youtu.be/2RuGooHVJUE %}

---

## 🚀 Getting Started in Under 2 Minutes

You can run Minomeet locally using **Docker** or standard **Node.js**:

### Option 1: 🐳 1-Command Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/shareefmx/minomeet.git
cd minomeet

# Launch Minomeet container
docker compose up -d
```
Open **`http://localhost:5001`** in your browser — all meeting data and audio uploads are automatically stored in persistent Docker volumes!

---

### Option 2: 💻 Global Terminal CLI

```bash
# 1. Clone & Install
git clone https://github.com/shareefmx/minomeet.git
cd minomeet
npm install
npm link

# 2. Launch casually anytime from any directory:
minomeet
```

```
   __  __ _                            _   
  |  \/  (_)_ __   ___  _ __ ___   ___  ___| |_ 
  | |\/| | | '_ \ / _ \| '_ ` _ \ / _ \/ _ \ __|
  | |  | | | | | | (_) | | | | | |  __/  __/ |_ 
  |_|  |_|_|_| |_|\___/|_| |_| |_|\___|\___|\__|

  Autonomous On-Device & Cloud AI Meeting Intelligence
  -----------------------------------------------------------------
  ➜  Web Application:  http://localhost:5173
  ➜  Backend API:      http://localhost:5001
  -----------------------------------------------------------------
  [o]  Open Minomeet in browser window
  [c]  Clear terminal screen
  [q]  Quit Minomeet
```
Just press **`o`** and your browser instantly opens Minomeet!

---

## 🌟 Try It Out & Support the Project

Minomeet is **100% open-source under the MIT License**. If you manage team meetings, sales demos, or daily standups, give it a spin for your next call!

- 💻 **GitHub Repository:** [https://github.com/shareefmx/minomeet](https://github.com/shareefmx/minomeet)
- 📺 **YouTube Walkthrough:** [https://youtu.be/2RuGooHVJUE](https://youtu.be/2RuGooHVJUE)
- 🐛 **Report Issues & Feature Requests:** [https://github.com/shareefmx/minomeet/issues](https://github.com/shareefmx/minomeet/issues)
- 💖 **Sponsor Development:** [https://github.com/sponsors/shareefmx](https://github.com/sponsors/shareefmx)

If you find the project useful, dropping a **⭐ on GitHub** means the world and helps support ongoing local AI development!

---

*What does your team's current meeting documentation workflow look like? Let me know in the comments below!*
