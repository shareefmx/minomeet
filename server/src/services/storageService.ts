import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Meeting, AppSettings } from '../types/index.js';
import { defaultMeetings, defaultSettings } from '../data/defaultMeetings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  meetings: Meeting[];
  settings: AppSettings;
}

class StorageService {
  private db: DatabaseSchema = {
    meetings: [...defaultMeetings],
    settings: { ...defaultSettings }
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.db = {
          meetings: parsed.meetings || [...defaultMeetings],
          settings: { ...defaultSettings, ...(parsed.settings || {}) }
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Failed to initialize storage database, using defaults:', err);
      this.db = {
        meetings: [...defaultMeetings],
        settings: { ...defaultSettings }
      };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Meetings CRUD
  public getMeetings(): Meeting[] {
    return this.db.meetings;
  }

  public getMeetingById(id: string): Meeting | undefined {
    return this.db.meetings.find(m => m.id === id);
  }

  public createMeeting(meeting: Meeting): Meeting {
    this.db.meetings.unshift(meeting);
    this.save();
    return meeting;
  }

  public updateMeeting(id: string, updates: Partial<Meeting>): Meeting | null {
    const index = this.db.meetings.findIndex(m => m.id === id);
    if (index === -1) return null;

    this.db.meetings[index] = {
      ...this.db.meetings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.db.meetings[index];
  }

  public deleteMeeting(id: string): boolean {
    const initialLength = this.db.meetings.length;
    this.db.meetings = this.db.meetings.filter(m => m.id !== id);
    if (this.db.meetings.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  // Settings
  public getSettings(): AppSettings {
    return this.db.settings;
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.db.settings = {
      ...this.db.settings,
      ...updates
    };
    this.save();
    return this.db.settings;
  }
}

export const storageService = new StorageService();

