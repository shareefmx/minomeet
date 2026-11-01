#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CLIENT_URL = 'http://localhost:5173';
const SERVER_URL = 'http://localhost:5001';

const children = [];

function openBrowser(url = CLIENT_URL) {
  const plat = process.platform;
  let cmd = '';
  if (plat === 'darwin') {
    cmd = `open "${url}"`;
  } else if (plat === 'win32') {
    cmd = `start "" "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }

  exec(cmd, (err) => {
    if (err) {
      console.log(`\n\x1b[33m➜  Could not auto-open browser. Please visit: ${url}\x1b[0m\n`);
    } else {
      console.log(`\n\x1b[32m✔  Opened Minomeet in default browser (${url})\x1b[0m\n`);
    }
  });
}

function renderBanner() {
  console.clear();
  console.log('\x1b[38;5;99m');
  console.log('   __  __ _                            _   ');
  console.log('  |  \\/  (_)_ __   ___  _ __ ___   ___  ___| |_ ');
  console.log('  | |\\/| | | \'_ \\ / _ \\| \'_ ` _ \\ / _ \\/ _ \\ __|');
  console.log('  | |  | | | | | | (_) | | | | | |  __/  __/ |_ ');
  console.log('  |_|  |_|_|_| |_|\\___/|_| |_| |_|\\___|\\___|\\__|');
  console.log('\x1b[0m');
  console.log('\x1b[1;36m  Autonomous On-Device & Cloud AI Meeting Intelligence (v1.2.0)\x1b[0m');
  console.log('\x1b[90m  -----------------------------------------------------------------\x1b[0m');
  console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mWeb Application:\x1b[0m  \x1b[36m${CLIENT_URL}\x1b[0m`);
  console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mBackend API:\x1b[0m      \x1b[36m${SERVER_URL}\x1b[0m`);
  console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mEnvironment:\x1b[0m      \x1b[33m100% Privacy-First On-Device\x1b[0m`);
  console.log('\x1b[90m  -----------------------------------------------------------------\x1b[0m');
  console.log('  \x1b[1;37mInteractive Shortcuts:\x1b[0m');
  console.log('  \x1b[32m[o]\x1b[0m  \x1b[1mOpen Minomeet in browser window\x1b[0m');
  console.log('  \x1b[34m[c]\x1b[0m  \x1b[1mClear terminal screen\x1b[0m');
  console.log('  \x1b[31m[q]\x1b[0m  \x1b[1mQuit Minomeet (or press Ctrl+C)\x1b[0m');
  console.log('\x1b[90m  -----------------------------------------------------------------\x1b[0m\n');
}

function cleanupAndExit() {
  console.log('\n\x1b[33m➜  Shutting down Minomeet services...\x1b[0m');
  for (const child of children) {
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${child.pid} /T /F`);
      } else {
        child.kill('SIGTERM');
      }
    } catch (_) {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);
process.on('exit', cleanupAndExit);

// Start Server and Client
function startServices() {
  renderBanner();

  // 1. Launch Backend Server
  const serverProc = spawn('npm', ['run', 'dev', '-w', 'server'], {
    cwd: ROOT_DIR,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '5001' }
  });
  children.push(serverProc);

  serverProc.stdout.on('data', (data) => {
    const text = data.toString();
    if (text.includes('Minomeet Server running') || text.includes('Server running on port')) {
      console.log(`\x1b[32m✔  API Backend Service Active (Port 5001)\x1b[0m`);
    }
  });

  serverProc.stderr.on('data', (data) => {
    const err = data.toString();
    if (!err.includes('ExperimentalWarning') && !err.includes('punycode')) {
      // Ignore routine warnings
    }
  });

  // 2. Launch Client Vite Dev Server
  const clientProc = spawn('npm', ['run', 'dev', '-w', 'client'], {
    cwd: ROOT_DIR,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env }
  });
  children.push(clientProc);

  let browserOpened = false;

  clientProc.stdout.on('data', (data) => {
    const text = data.toString();
    if ((text.includes('Local:') || text.includes('ready in') || text.includes('5173')) && !browserOpened) {
      browserOpened = true;
      console.log(`\x1b[32m✔  Web Client Active at ${CLIENT_URL}\x1b[0m`);
      console.log(`\n\x1b[1;35m👉 Press 'o' to open Minomeet in your browser anytime.\x1b[0m\n`);
    }
  });

  // 3. Setup Keyboard Shortcut Listener
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      process.stdin.on('data', (key) => {
        // Ctrl+C or 'q' / 'Q' -> Quit
        if (key === '\u0003' || key.toLowerCase() === 'q') {
          cleanupAndExit();
        } else if (key.toLowerCase() === 'o') {
          openBrowser(CLIENT_URL);
        } else if (key.toLowerCase() === 'c') {
          renderBanner();
        }
      });
    } catch (_) {
      // Fallback for non-TTY shells
    }
  } else {
    // Non-raw mode fallback
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      const line = chunk.toString().trim().toLowerCase();
      if (line === 'o') {
        openBrowser(CLIENT_URL);
      } else if (line === 'q') {
        cleanupAndExit();
      } else if (line === 'c') {
        renderBanner();
      }
    });
  }
}

startServices();

