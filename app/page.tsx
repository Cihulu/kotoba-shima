'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUser } from './context/UserContext';
import WarmUp from './components/WarmUp';
import { allKana } from './data/kana';
import { vocabulary } from './data/vocabulary';

// ── Zone definitions ──────────────────────────────────────────────
const zones = [
  {
    href: '/gojuuon',
    key: 'gojuuon' as const,
    zoneId: 'ZONE 1',
    zoneName: '入門村',
    icon: 'あ',
    title: '五十音図',
    sub: 'Hiragana & Katakana',
    desc: '平假名和片假名，表格浏览 + 闯关测验',
    bg:   '#d4edcc',
    mid:  '#a8d8a0',
    dark: '#2d6e2a',
  },
  {
    href: '/flashcards',
    key: 'flashcards' as const,
    zoneId: 'ZONE 2',
    zoneName: '単語の森',
    icon: '語',
    title: '単語フラッシュ',
    sub: 'Vocabulary Flashcards',
    desc: 'N5 / N4 / N3 分级练习，翻转卡片，记入生字本',
    bg:   '#fde8b0',
    mid:  '#f5c860',
    dark: '#7a4800',
  },
  {
    href: '/puzzle',
    key: 'flashcards' as const,
    zoneId: 'ZONE 3',
    zoneName: '謎の神殿',
    icon: '？',
    title: '句子解謎',
    sub: 'Grammar Puzzle',
    desc: '点击词语分析语法角色，像解谜一样读懂日语',
    bg:   '#ede9fe',
    mid:  '#c4b5fd',
    dark: '#4c1d95',
  },
  {
    href: '/notebook',
    key: 'flashcards' as const,
    zoneId: 'LOG',
    zoneName: '冒険日誌',
    icon: '日',
    title: '笔记本',
    sub: 'Adventure Log',
    desc: '生字本 + 语法笔记，随时翻看复习',
    bg:   '#fde8e8',
    mid:  '#f4a7a0',
    dark: '#7f1d1d',
  },
];

const moduleHref: Record<string, string> = {
  gojuuon: '/gojuuon',
  flashcards: '/flashcards',
  grammar: '/grammar',
  puzzle: '/puzzle',
};

const moduleLabel: Record<string, string> = {
  gojuuon: '五十音',
  flashcards: '単語フラッシュ',
  grammar: '语法',
  puzzle: '句子解謎',
};

// ── First-time screen ─────────────────────────────────────────────
function FirstTimeScreen() {
  const { createUser } = useUser();
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-sm w-full fade-up">

        {/* Logo big */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 text-4xl mb-4"
               style={{ border: '4px solid var(--border)', background: 'var(--amber-bg)', boxShadow: 'var(--shadow)' }}>
            島
          </div>
          <div className="font-bold text-3xl" style={{ color: 'var(--text)' }}>ことば島</div>
          <div className="font-pixel text-[9px] mt-1" style={{ color: 'var(--muted)' }}>KOTOBA-SHIMA</div>
        </div>

        <div className="px-divider mb-6" />

        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>先告诉我你的名字，开始冒险吧！</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && createUser(name.trim())}
            placeholder="你的名字"
            autoFocus
            className="flex-1 px-4 py-3 text-sm outline-none"
            style={{ border: '3px solid var(--border)', background: 'var(--card)', color: 'var(--text)', borderRadius: '2px' }}
          />
          <button
            onClick={() => name.trim() && createUser(name.trim())}
            disabled={!name.trim()}
            className="px-btn px-5 py-3 text-sm font-bold disabled:opacity-40"
            style={{ background: 'var(--border)', color: 'var(--card)' }}
          >
            ▶ 出発
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Zone card ─────────────────────────────────────────────────────
function ZoneCard({ zone, onClick }: { zone: typeof zones[0]; onClick?: () => void }) {
  return (
    <Link
      href={zone.href}
      onClick={onClick}
      className="block group"
      style={{ border: `3px solid ${zone.dark}`, boxShadow: `5px 5px 0 ${zone.dark}`, background: zone.bg, borderRadius: '2px', transition: 'transform 0.07s, box-shadow 0.07s' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translate(2px, 2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 0 ${zone.dark}`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `5px 5px 0 ${zone.dark}`; }}
    >
      {/* Zone header strip */}
      <div className="px-4 py-2 flex items-center justify-between"
           style={{ background: zone.dark, borderBottom: `3px solid ${zone.dark}` }}>
        <span className="font-pixel text-[8px] text-white opacity-90">{zone.zoneId}</span>
        <span className="font-bold text-white text-sm tracking-wide">{zone.zoneName}</span>
      </div>

      {/* Content */}
      <div className="p-5 flex gap-4 items-start">
        {/* Icon */}
        <div className="shrink-0 w-14 h-14 flex items-center justify-center text-3xl font-bold"
             style={{ border: `3px solid ${zone.dark}`, background: zone.mid, color: zone.dark, borderRadius: '2px', boxShadow: `3px 3px 0 ${zone.dark}` }}>
          {zone.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base mb-0.5" style={{ color: zone.dark }}>{zone.title}</div>
          <div className="font-pixel text-[7px] mb-2 opacity-60" style={{ color: zone.dark }}>{zone.sub}</div>
          <p className="text-xs leading-relaxed" style={{ color: '#7a6a55' }}>{zone.desc}</p>
        </div>
      </div>

      {/* Enter button */}
      <div className="px-5 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold"
             style={{ border: `2px solid ${zone.dark}`, background: zone.mid, color: zone.dark, borderRadius: '2px', boxShadow: `2px 2px 0 ${zone.dark}` }}>
          ▶ 進入
        </div>
      </div>
    </Link>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────
export default function HomePage() {
  const { user, updateUser } = useUser();
  const router = useRouter();
  const [showWarmUp, setShowWarmUp] = useState(false);

  if (!user) return <FirstTimeScreen />;

  const kanaKnown  = new Set(user.kanaCorrect).size;
  const vocabKnown = user.vocabKnown.length;
  const notesCount = (user.notes ?? []).length;
  const hasHistory = user.kanaCorrect.length >= 2 || user.vocabKnown.length >= 2;

  const handleWarmUpFinish = (goTo: 'continue' | 'home') => {
    setShowWarmUp(false);
    if (goTo === 'continue' && user.lastModule) {
      router.push(moduleHref[user.lastModule]);
    }
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-5 py-8">

      {/* Header */}
      <div className="mb-6 fade-up flex items-end justify-between">
        <div>
          <div className="font-pixel text-[9px] mb-1" style={{ color: '#7a6a55' }}>PLAYER</div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a0f00' }}>{user.name}</h1>
        </div>

        {/* Stats row */}
        <div className="flex gap-3">
          {[
            { label: 'KANA',  val: kanaKnown,  total: allKana.length,    dark: '#2d6e2a', bg: '#d4edcc', mid: '#a8d8a0' },
            { label: 'WORDS', val: vocabKnown, total: vocabulary.length, dark: '#7a4800', bg: '#fde8b0', mid: '#f5c860' },
            { label: 'NOTES', val: notesCount, total: null,              dark: '#7f1d1d', bg: '#fde8e8', mid: '#f4a7a0' },
          ].map((s) => (
            <div key={s.label} className="text-center px-4 py-2"
                 style={{ border: `2px solid ${s.dark}`, background: s.bg, boxShadow: `3px 3px 0 ${s.dark}`, borderRadius: '2px' }}>
              <div className="font-pixel text-[7px] mb-1" style={{ color: s.dark }}>{s.label}</div>
              <div className="font-pixel text-lg leading-none" style={{ color: s.dark }}>{s.val}</div>
              {s.total && <div className="text-[9px] mt-0.5" style={{ color: s.dark, opacity: 0.6 }}>/{s.total}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="px-divider mb-6" />

      {/* Warm-up + continue row */}
      {(hasHistory || user.lastModule) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {hasHistory && !showWarmUp && (
            <button
              onClick={() => setShowWarmUp(true)}
              className="text-left p-4 flex items-center gap-3 active:translate-x-[3px] active:translate-y-[3px] transition-all"
              style={{ background: '#fde8b0', border: '3px solid #7a4800', boxShadow: '4px 4px 0 #7a4800', borderRadius: '2px' }}
            >
              <div className="w-10 h-10 flex items-center justify-center text-xl shrink-0 font-bold"
                   style={{ border: '2px solid #7a4800', background: '#f5c860', borderRadius: '2px' }}>
                🔥
              </div>
              <div>
                <div className="font-pixel text-[8px] mb-1" style={{ color: '#7a4800' }}>WARM UP</div>
                <div className="font-bold text-sm" style={{ color: '#7a4800' }}>热身 3 题</div>
                <div className="text-xs mt-0.5" style={{ color: '#7a6a55' }}>重新激活上次学过的内容</div>
              </div>
            </button>
          )}

          {showWarmUp && (
            <WarmUp
              kanaCorrect={user.kanaCorrect}
              vocabKnown={user.vocabKnown}
              lastModule={user.lastModule}
              onFinish={handleWarmUpFinish}
            />
          )}

          {user.lastModule && moduleHref[user.lastModule] && (
            <Link
              href={moduleHref[user.lastModule]}
              className="block p-4 active:translate-x-[3px] active:translate-y-[3px] transition-all"
              style={{ border: '3px solid #2d1810', boxShadow: '4px 4px 0 #2d1810', background: '#fffdf7', borderRadius: '2px' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center text-xl shrink-0"
                     style={{ border: '2px solid #2d1810', background: '#fdf6e3', borderRadius: '2px' }}>
                  ↩
                </div>
                <div>
                  <div className="font-pixel text-[8px] mb-1" style={{ color: '#7a6a55' }}>CONTINUE</div>
                  <div className="font-bold text-sm" style={{ color: '#1a0f00' }}>
                    {moduleLabel[user.lastModule]}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#7a6a55' }}>继续上次的学习</div>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* World map label */}
      <div className="font-pixel text-[9px] mb-4" style={{ color: '#7a6a55' }}>WORLD MAP</div>

      {/* Zone grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {zones.map((z) => (
          <ZoneCard
            key={z.href}
            zone={z}
            onClick={() => updateUser({ lastModule: z.key })}
          />
        ))}
      </div>
    </div>
  );
}
