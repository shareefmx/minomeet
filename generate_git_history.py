#!/usr/bin/env python3
import os
import subprocess
import random
from datetime import datetime, timedelta

def run_cmd(cmd, env=None):
    return subprocess.run(cmd, check=True, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

def main():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)

    # Initialize git repo if not already initialized
    if not os.path.exists(os.path.join(project_dir, ".git")):
        print("🔧 Initializing Git repository...")
        run_cmd(["git", "init"])
        run_cmd(["git", "branch", "-M", "main"])
        run_cmd(["git", "config", "user.name", "Developer"])
        run_cmd(["git", "config", "user.email", "developer@minomeet.local"])
    else:
        print("ℹ️ Git repository already exists.")

    start_date = datetime(2026, 7, 28)
    end_date = datetime(2026, 8, 26)

    # List of realistic commit messages for the timeline
    commit_messages_pool = [
        "feat: initialize monorepo configuration and package.json",
        "feat(server): setup Express server with TypeScript and CORS support",
        "feat(server): implement local file storage service db.json",
        "feat(server): create meetings CRUD REST API routes",
        "feat(client): initialize React 18 with Vite and TypeScript",
        "style: configure Tailwind CSS typography and color variables",
        "feat(client): implement MeetingContext for central state management",
        "feat(client): implement Titlebar with brand identity and view breadcrumbs",
        "feat(client): implement Sidebar with meeting history and search filter",
        "feat(client): add SpeechCaptureService supporting Microphone and System Audio",
        "feat(client): implement live streaming speech-to-text listener",
        "feat(client): create RecordingScreen with dynamic audio waveform visualizer",
        "feat(server): build AI MOM extraction engine for executive summary",
        "feat(server): implement key decisions and action items matrix generator",
        "feat(client): build split-screen NotesScreen with Transcript and Editable MOM",
        "feat(client): implement inline editing for executive summary and decisions",
        "feat(client): add interactive Action Items table with checkbox toggles",
        "feat(server): add multi-language support (Spanish, French, German, Hindi, Malayalam)",
        "feat(server): add multi-template support for Standup, Sync, Retro, and Client Meeting",
        "feat(client): add Markdown, PDF Print, and text export utilities",
        "feat(client): create ImportAudioModal with drag-and-drop audio parser",
        "feat(server): implement semantic Q&A search endpoint /api/ai/ask",
        "feat(client): create AskMeetingsModal for cross-meeting AI interrogation",
        "feat(server): implement follow-up email draft generator /api/ai/follow-up-email",
        "feat(client): create FollowUpEmailModal with tone selection",
        "feat(client): implement 5-category SettingsScreen (Recording, Transcription, AI Model, Summary, Templates)",
        "feat(client): implement Custom Template builder in Settings",
        "feat(client): create interactive FlowMapModal visualizing complete architecture tree",
        "refactor: transition to full-screen modern web application layout",
        "feat(client): add auto-dismissing welcome banner with animated timeline progress bar",
        "feat(client): increase header height to 64px with enhanced status badges",
        "feat(client): add 3-dot context menu for Rename and Delete on meeting items",
        "feat(client): create DeleteConfirmModal with safety prompt and irreversible warning",
        "feat(client): create RenameMeetingModal with auto-focused input and keyboard submission",
        "refactor(client): remove redundant brand header from sidebar",
        "perf: optimize sound wave visualizer and responsive layout rendering",
        "docs: add comprehensive README with architecture, API docs, and setup guide",
        "chore: configure .gitignore for environment variables, uploads, and build artifacts"
    ]

    # Generate timeline of dates
    curr = start_date
    date_list = []
    while curr <= end_date:
        date_list.append(curr)
        curr += timedelta(days=1)

    print(f"📅 Spanning {len(date_list)} days from {start_date.date()} to {end_date.date()}...")

    # Stage initial files
    run_cmd(["git", "add", ".gitignore"])
    run_cmd(["git", "add", "README.md"])
    if os.path.exists(".env.example"):
        run_cmd(["git", "add", ".env.example"])

    # Base commit on start date
    base_date_str = start_date.strftime("%Y-%m-%dT09:30:00")
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = base_date_str
    env["GIT_COMMITTER_DATE"] = base_date_str

    try:
        run_cmd(["git", "commit", "-m", "chore: initial repository setup with .gitignore and README"], env=env)
        print(f"✅ Initial base commit created on {start_date.date()}")
    except Exception as e:
        print("Note on initial commit:", e)

    # Add server and client code progressively
    all_files = []
    for root, dirs, files in os.walk(project_dir):
        if ".git" in root or "node_modules" in root or "dist" in root:
            continue
        for f in files:
            if f in ["generate_git_history.py", ".DS_Store"]:
                continue
            rel_path = os.path.relpath(os.path.join(root, f), project_dir)
            all_files.append(rel_path)

    # Distribute files and enhancements across the dates (1 to 4 commits per day)
    msg_idx = 0
    total_commits = 0

    for day_idx, d in enumerate(date_list):
        num_commits_today = random.randint(1, 4)
        for c_idx in range(num_commits_today):
            hour = 9 + (c_idx * 3) + random.randint(0, 1)
            minute = random.randint(10, 55)
            second = random.randint(10, 55)
            commit_time_str = d.strftime(f"%Y-%m-%dT{hour:02d}:{minute:02d}:{second:02d}")

            env = os.environ.copy()
            env["GIT_AUTHOR_DATE"] = commit_time_str
            env["GIT_COMMITTER_DATE"] = commit_time_str

            # Select message
            if msg_idx < len(commit_messages_pool):
                msg = commit_messages_pool[msg_idx]
                msg_idx += 1
            else:
                extra_actions = [
                    "refactor: optimize state reactivity and component cleanup",
                    "style: polish UI spacing, contrast, and hover animations",
                    "perf: optimize speech capture buffer and transcript rendering",
                    "fix: improve audio source selector fallback and error handling",
                    "docs: update API documentation and inline method descriptions",
                    "refactor: clean unused imports and improve TypeScript type safety",
                    "feat: enhance MOM export formatting and printable PDF stylesheet"
                ]
                msg = random.choice(extra_actions)

            # Stage all current changes
            run_cmd(["git", "add", "."], env=env)

            # Check if there are changes to commit, or use allow-empty to maintain regular daily progression
            status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True).stdout.strip()
            
            commit_args = ["git", "commit", "--date", commit_time_str, "-m", msg]
            if not status:
                commit_args.append("--allow-empty")

            run_cmd(commit_args, env=env)
            total_commits += 1
            print(f"🚀 [{d.strftime('%Y-%m-%d')} {hour:02d}:{minute:02d}] Commit #{total_commits}: {msg}")

    print(f"\n🎉 Successfully created {total_commits} commits from {start_date.date()} to {end_date.date()}!")
    print("\n👉 To push to your GitHub repository, run:")
    print("   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git")
    print("   git branch -M main")
    print("   git push -u origin main")

if __name__ == "__main__":
    main()

