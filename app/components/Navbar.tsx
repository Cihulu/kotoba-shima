'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

const BORDER = '#2d1810';
const CARD   = '#fffdf7';
const BG     = '#fdf6e3';
const TEXT   = '#1a0f00';
const MUTED  = '#7a6a55';

const navItems = [
  { href: '/',            label: 'ホーム' },
  { href: '/gojuuon',    label: '五十音' },
  { href: '/flashcards', label: '単語' },
  { href: '/puzzle',     label: '解謎' },
  { href: '/notebook',   label: 'ノート' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, users, switchUser, createUser } = useUser();
  const [open, setOpen]       = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createUser(newName.trim());
    setNewName('');
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50"
         style={{ background: CARD, borderBottom: `3px solid ${BORDER}`, boxShadow: `0 3px 0 ${BORDER}` }}>
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 flex items-center justify-center text-lg font-bold"
               style={{ border: `2px solid ${BORDER}`, background: '#fde8b0', boxShadow: `2px 2px 0 ${BORDER}`, borderRadius: '2px' }}>
            島
          </div>
          <div>
            <div className="font-bold text-base tracking-tight leading-none" style={{ color: TEXT }}>
              ことば島
            </div>
            <div className="font-pixel text-[6px] leading-none mt-0.5" style={{ color: MUTED }}>
              KOTOBA-SHIMA
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm font-medium"
                style={active
                  ? { background: BORDER, color: CARD, border: `2px solid ${BORDER}`, borderRadius: '2px' }
                  : { color: MUTED, border: '2px solid transparent', borderRadius: '2px' }}
              >
                {item.label}
              </Link>
            );
          })}

          {/* User switcher */}
          <div className="relative ml-2">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
              style={{ border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, background: CARD, color: TEXT, borderRadius: '2px' }}
            >
              <span className="text-xs">▲</span>
              <span className="max-w-[72px] truncate text-xs font-medium">{user?.name ?? '选择'}</span>
            </button>

            {open && (
              <div className="absolute right-0 top-12 w-52 z-50"
                   style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `4px 4px 0 ${BORDER}`, borderRadius: '2px' }}>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { switchUser(u.id); setOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2"
                    style={u.id === user?.id
                      ? { background: BORDER, color: CARD, fontWeight: 600 }
                      : { color: TEXT }}
                  >
                    ▶ {u.name}
                    {u.id === user?.id && <span className="ml-auto text-xs opacity-60">当前</span>}
                  </button>
                ))}

                <div style={{ borderTop: `2px solid ${BORDER}`, padding: '8px' }}>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                      placeholder="新用户名"
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs outline-none"
                      style={{ border: `2px solid ${BORDER}`, background: BG, color: TEXT, borderRadius: '2px' }}
                    />
                    <button
                      onClick={handleCreate}
                      disabled={!newName.trim()}
                      className="px-2.5 py-1.5 text-xs font-bold disabled:opacity-40"
                      style={{ border: `3px solid ${BORDER}`, boxShadow: `2px 2px 0 ${BORDER}`, background: BORDER, color: CARD, borderRadius: '2px' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
