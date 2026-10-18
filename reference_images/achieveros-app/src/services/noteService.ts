import type { StickyNote } from '../types';
import { storage } from '../utils/storage';
import { seedNotes } from '../utils/seedData';
import { generateId } from '../utils/dateUtils';

const STORAGE_KEY = 'notes';

function getAll(): StickyNote[] {
  const notes = storage.get<StickyNote[]>(STORAGE_KEY);
  if (!notes) {
    storage.set(STORAGE_KEY, seedNotes);
    return seedNotes;
  }
  return notes;
}

function save(notes: StickyNote[]): void {
  storage.set(STORAGE_KEY, notes);
}

export const noteService = {
  async getAll(): Promise<StickyNote[]> {
    return getAll();
  },

  async create(note: Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<StickyNote> {
    const now = new Date().toISOString();
    const newNote: StickyNote = { ...note, id: generateId(), createdAt: now, updatedAt: now };
    const notes = getAll();
    notes.push(newNote);
    save(notes);
    return newNote;
  },

  async update(id: string, updates: Partial<StickyNote>): Promise<StickyNote | null> {
    const notes = getAll();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return null;
    notes[index] = { ...notes[index], ...updates, updatedAt: new Date().toISOString() };
    save(notes);
    return notes[index];
  },

  async delete(id: string): Promise<boolean> {
    const notes = getAll();
    const filtered = notes.filter(n => n.id !== id);
    if (filtered.length === notes.length) return false;
    save(filtered);
    return true;
  },
};
