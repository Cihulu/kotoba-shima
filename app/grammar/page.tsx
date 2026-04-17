'use client';

import { useState, useEffect } from 'react';
import { grammarPoints, GrammarPoint } from '../data/grammar';
import { useUser } from '../context/UserContext';

const levelStyle: Record<string, string> = {
  N5: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  N4: 'bg-sky-50    text-sky-600    border-sky-200',
  N3: 'bg-orange-50 text-orange-600 border-orange-200',
};

function GrammarCard({ point, defaultOpen, onOpen }: { point: GrammarPoint; defaultOpen?: boolean; onOpen?: (id: string) => void }) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
      open ? 'border-indigo-200' : 'border-[#e4e7f0] hover:border-indigo-100'
    }`}>
      {/* Collapsed header */}
      <button
        className="w-full text-left px-6 py-5 flex items-center gap-4"
        onClick={() => { setOpen((o) => { if (!o) onOpen?.(point.id); return !o; }); }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="font-bold text-[#2d3142] text-base">{point.title}</h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${levelStyle[point.level]}`}>
              {point.level}
            </span>
          </div>
          <p className="text-slate-400 text-sm">{point.summary}</p>
        </div>
        <span className={`text-slate-300 text-xl shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>›</span>
      </button>

      {/* Expanded */}
      {open && (
        <div className="px-6 pb-6 border-t border-[#f0f2f8] fade-up">
          {/* Pattern */}
          <div className="mt-4 mb-5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-1">句型</p>
            <p className="text-slate-700 font-mono text-sm">{point.pattern}</p>
          </div>

          {/* Explanation */}
          <p className="text-slate-600 text-sm leading-relaxed mb-5">{point.explanation}</p>

          {/* Tips */}
          <div className="mb-5">
            <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-widest mb-2">记忆要点</p>
            <ul className="space-y-1.5">
              {point.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-indigo-300 mt-0.5 shrink-0">▸</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Examples */}
          <div>
            <p className="text-rose-400 text-[10px] font-semibold uppercase tracking-widest mb-3">例句</p>
            <div className="space-y-2.5">
              {point.examples.map((ex, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="font-bold text-[#2d3142] text-base mb-1">{ex.japanese}</p>
                  <p className="text-slate-400 text-xs mb-1 italic">{ex.reading}</p>
                  <p className="text-slate-500 text-sm">{ex.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GrammarPage() {
  const { user, updateUser } = useUser();
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'N5' | 'N4' | 'N3'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => { updateUser({ lastModule: 'grammar' }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = (id: string) => {
    if (!user) return;
    if (!user.grammarRead.includes(id)) {
      updateUser({ grammarRead: [...user.grammarRead, id] });
    }
  };

  const filtered = grammarPoints.filter((p) =>
    (filterLevel === 'ALL' || p.level === filterLevel) &&
    (search === '' || p.title.includes(search) || p.summary.includes(search))
  );

  return (
    <div className="min-h-screen px-5 py-10 max-w-3xl mx-auto">

      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[#2d3142]">📖 语法辨义</h1>
        <p className="text-slate-400 text-sm mt-0.5">点击展开详解 · 对比易混语法点</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-7">
        <div className="flex rounded-xl overflow-hidden border border-[#e4e7f0] bg-white">
          {(['ALL', 'N5', 'N4', 'N3'] as const).map((l) => {
            const activeStyle =
              l === 'ALL' ? 'bg-indigo-500 text-white' :
              l === 'N5'  ? 'bg-emerald-500 text-white' :
              l === 'N4'  ? 'bg-sky-500 text-white' :
                             'bg-orange-500 text-white';
            return (
              <button
                key={l}
                onClick={() => setFilterLevel(l)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  filterLevel === l ? activeStyle : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索语法点…"
          className="flex-1 min-w-[140px] px-4 py-2 rounded-xl bg-white border border-[#e4e7f0] text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-indigo-300 transition-colors"
        />
      </div>

      <p className="text-slate-300 text-xs mb-4">{filtered.length} 个语法点</p>

      {filtered.length > 0 ? (
        <div className="space-y-2.5 fade-up">
          {filtered.map((p, i) => (
            <GrammarCard key={p.id} point={p} defaultOpen={i === 0} onOpen={handleOpen} />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-300 mt-20">没有找到匹配的语法点</div>
      )}
    </div>
  );
}
