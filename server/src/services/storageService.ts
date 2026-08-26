import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Meeting, AppSettings, MOMTemplate } from '../types/index.js';
import { defaultMeetings, defaultSettings } from '../data/defaultMeetings.js';
import { defaultTemplates } from '../data/defaultTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  meetings: Meeting[];
  settings: AppSettings;
  templates: MOMTemplate[];
}

class StorageService {
  private db: DatabaseSchema = {
    meetings: [...defaultMeetings],
    settings: { ...defaultSettings },
    templates: [...defaultTemplates]
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
          settings: { ...defaultSettings, ...(parsed.settings || {}) },
          templates: parsed.templates && parsed.templates.length > 0 ? parsed.templates : [...defaultTemplates]
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Failed to initialize storage database, using defaults:', err);
      this.db = {
        meetings: [...defaultMeetings],
        settings: { ...defaultSettings },
        templates: [...defaultTemplates]
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

  // Templates CRUD
  public getTemplates(): MOMTemplate[] {
    if (!this.db.templates || this.db.templates.length === 0) {
      this.db.templates = [...defaultTemplates];
      this.save();
    }
    return this.db.templates;
  }

  public getTemplateById(id: string): MOMTemplate | undefined {
    return this.getTemplates().find(t => t.id === id || t.name.toLowerCase() === id.toLowerCase());
  }

  public createTemplate(template: MOMTemplate): MOMTemplate {
    const templates = this.getTemplates();
    const created: MOMTemplate = {
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (created.isDefault) {
      templates.forEach(t => t.isDefault = false);
      this.updateSettings({ defaultTemplate: created.name });
    }
    templates.push(created);
    this.db.templates = templates;
    this.save();
    return created;
  }

  public updateTemplate(id: string, updates: Partial<MOMTemplate>): MOMTemplate | null {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === id);
    if (index === -1) return null;

    if (updates.isDefault) {
      templates.forEach(t => t.isDefault = false);
      this.updateSettings({ defaultTemplate: updates.name || templates[index].name });
    }

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.db.templates = templates;
    this.save();
    return templates[index];
  }

  public deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const target = templates.find(t => t.id === id);
    if (!target) return false;

    this.db.templates = templates.filter(t => t.id !== id);
    // If deleted template was default, make the first template default
    if (target.isDefault && this.db.templates.length > 0) {
      this.db.templates[0].isDefault = true;
      this.updateSettings({ defaultTemplate: this.db.templates[0].name });
    }
    this.save();
    return true;
  }

  public setDefaultTemplate(id: string): MOMTemplate | null {
    const templates = this.getTemplates();
    const target = templates.find(t => t.id === id);
    if (!target) return null;

    templates.forEach(t => t.isDefault = (t.id === id));
    this.db.templates = templates;
    this.updateSettings({ defaultTemplate: target.name });
    this.save();
    return target;
  }
}

export const storageService = new StorageService();


