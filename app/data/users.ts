import type { SRSCard } from '../lib/srs';
export type { SRSCard };

export interface NoteEntry {
  id: string;
  savedAt: string;
  source: 'puzzle' | 'vocab';
  word: string;
  reading: string;
  sentence: string;
  // puzzle-specific
  type?: string;
  question?: string;
  answer?: string;
  explanation?: string;
  // vocab-specific
  romaji?: string;
  meaning?: string;
  level?: string;
  category?: string;
  sentenceReading?: string;
  sentenceMeaning?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  lastModule: 'gojuuon' | 'flashcards' | 'grammar' | null;
  kanaCorrect: string[];
  vocabKnown: string[];
  vocabUnknown: string[];
  grammarRead: string[];
  notes: NoteEntry[];
  srsCards: SRSCard[];
}

const USERS_KEY = 'nq-users';
const CURRENT_KEY = 'nq-current-user-id';

export function loadUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveUsers(users: UserProfile[]): void {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
}

export function loadCurrentUserId(): string | null {
  try { return localStorage.getItem(CURRENT_KEY); } catch { return null; }
}

export function saveCurrentUserId(id: string): void {
  try { localStorage.setItem(CURRENT_KEY, id); } catch {}
}

export function createEmptyUser(name: string): UserProfile {
  return {
    id: Date.now().toString(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    lastModule: null,
    kanaCorrect: [],
    vocabKnown: [],
    vocabUnknown: [],
    grammarRead: [],
    notes: [],
    srsCards: [],
  };
}
