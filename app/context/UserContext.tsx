'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile, NoteEntry,
  loadUsers, saveUsers,
  loadCurrentUserId, saveCurrentUserId,
  createEmptyUser,
} from '../data/users';
import { newCard, reviewCard } from '../lib/srs';

interface UserContextType {
  user: UserProfile | null;
  users: UserProfile[];
  switchUser: (id: string) => void;
  createUser: (name: string) => UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  addNote: (entry: Omit<NoteEntry, 'id' | 'savedAt'>) => void;
  deleteNote: (noteId: string) => void;
  updateSRS: (word: string, correct: boolean) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadUsers().map((u) => {
      const notes = (u.notes ?? []).map((n) => ({
        ...n,
        source: (n.source ?? 'puzzle') as 'puzzle' | 'vocab',
      }));
      return { ...u, notes, srsCards: u.srsCards ?? [] };
    });
    const savedId = loadCurrentUserId();
    setUsers(loaded);
    if (savedId && loaded.find((u) => u.id === savedId)) {
      setCurrentId(savedId);
    } else if (loaded.length > 0) {
      setCurrentId(loaded[0].id);
    }
    setReady(true);
  }, []);

  const user = users.find((u) => u.id === currentId) ?? null;

  const switchUser = (id: string) => {
    setCurrentId(id);
    saveCurrentUserId(id);
  };

  const createUser = (name: string): UserProfile => {
    const newUser = createEmptyUser(name);
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    setCurrentId(newUser.id);
    saveCurrentUserId(newUser.id);
    return newUser;
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!currentId) return;
    const updated = users.map((u) =>
      u.id === currentId ? { ...u, ...updates } : u
    );
    setUsers(updated);
    saveUsers(updated);
  };

  const addNote = (entry: Omit<NoteEntry, 'id' | 'savedAt'>) => {
    if (!currentId) return;
    const note: NoteEntry = {
      ...entry,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
    };
    const updated = users.map((u) =>
      u.id === currentId ? { ...u, notes: [note, ...u.notes] } : u
    );
    setUsers(updated);
    saveUsers(updated);
  };

  const updateSRS = (word: string, correct: boolean) => {
    if (!currentId) return;
    const updated = users.map((u) => {
      if (u.id !== currentId) return u;
      const existing = u.srsCards.find((c) => c.word === word);
      const updatedCard = existing
        ? reviewCard(existing, correct)
        : (() => {
            const card = newCard(word);
            return correct ? card : { ...card, lapses: 1 };
          })();
      const srsCards = existing
        ? u.srsCards.map((c) => (c.word === word ? updatedCard : c))
        : [...u.srsCards, updatedCard];
      return { ...u, srsCards };
    });
    setUsers(updated);
    saveUsers(updated);
  };

  const deleteNote = (noteId: string) => {
    if (!currentId) return;
    const updated = users.map((u) =>
      u.id === currentId ? { ...u, notes: u.notes.filter((n) => n.id !== noteId) } : u
    );
    setUsers(updated);
    saveUsers(updated);
  };

  const deleteUser = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
    if (currentId === id) {
      const next = updated[0]?.id ?? null;
      setCurrentId(next);
      if (next) saveCurrentUserId(next);
    }
  };

  if (!ready) return null;

  return (
    <UserContext.Provider value={{ user, users, switchUser, createUser, updateUser, deleteUser, addNote, deleteNote, updateSRS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
