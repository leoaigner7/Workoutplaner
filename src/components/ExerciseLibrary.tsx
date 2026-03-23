import { useState, useMemo, useRef, useCallback } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { exercises } from '../data/exercises';
import type { Exercise, MuscleGroup, Difficulty, ExerciseTag } from '../types';

interface Props {
  onAddExercise: (exercise: Exercise) => void;
  addedIds: Set<string>;
}

type CategoryFilter = 'all' | 'football' | 'injury-ham' | 'injury-ank' | 'strength';

const muscleLabels: Record<MuscleGroup, string> = {
  chest: 'Brust', back: 'Rücken', shoulders: 'Schultern',
  biceps: 'Bizeps', triceps: 'Trizeps', legs: 'Beine',
  hamstrings: 'Oberschenkel', calves: 'Waden', glutes: 'Gesäß',
  core: 'Core', cardio: 'Cardio', 'full-body': 'Ganzkörper', ankle: 'Sprunggelenk',
};

const difficultyConfig: Record<Difficulty, { label: string; bg: string; text: string }> = {
  beginner:     { label: 'Anfänger',       bg: 'bg-emerald-100', text: 'text-emerald-700' },
  intermediate: { label: 'Mittel',          bg: 'bg-amber-100',  text: 'text-amber-700'  },
  advanced:     { label: 'Fortgeschritten', bg: 'bg-red-100',    text: 'text-red-700'    },
};

const equipmentLabel: Record<string, string> = {
  none: 'Kein Equipment', dumbbells: 'Kurzhanteln', barbell: 'Langhantel',
  kettlebell: 'Kettlebell', 'resistance-band': 'Widerstandsband',
  'pull-up-bar': 'Klimmzugstange', bench: 'Bank', machine: 'Maschine',
  cable: 'Kabelzug', 'foam-roller': 'Foam Roller', 'balance-board': 'Bosu-Board',
};

const equipmentIcon: Record<string, string> = {
  none: '🤸', dumbbells: '🏋️', barbell: '🏋️', kettlebell: '🔔',
  'resistance-band': '🪢', 'pull-up-bar': '🔩', bench: '🪑',
  machine: '⚙️', cable: '🔗', 'foam-roller': '🛞', 'balance-board': '🤹',
};

const tagConfig: Record<ExerciseTag, { label: string; bg: string; text: string }> = {
  football:            { label: '⚽ Fußball',        bg: 'bg-teal-100',   text: 'text-teal-700'   },
  'injury-prevention': { label: '🛡️ Prävention',    bg: 'bg-orange-100', text: 'text-orange-700' },
  eccentric:           { label: '📉 Exzentrisch',    bg: 'bg-red-100',    text: 'text-red-700'    },
  plyometric:          { label: '⚡ Plyometrisch',   bg: 'bg-yellow-100', text: 'text-yellow-700' },
  proprioception:      { label: '🎯 Propriozeption', bg: 'bg-pink-100',   text: 'text-pink-700'   },
  strength:            { label: '💪 Kraft',          bg: 'bg-violet-100', text: 'text-violet-700' },
  mobility:            { label: '🧘 Mobilität',      bg: 'bg-indigo-100', text: 'text-indigo-700' },
  stability:           { label: '🏔️ Stabilität',    bg: 'bg-sky-100',    text: 'text-sky-700'    },
};

/* Image-area colour per exercise */
type ImgStyle = { bg: string; accent: string };
function getImgStyle(e: Exercise): ImgStyle {
  if (e.tags.includes('football'))                                          return { bg: 'bg-teal-500',   accent: 'text-teal-900' };
  if (e.muscleGroup === 'ankle')                                            return { bg: 'bg-emerald-500',accent: 'text-emerald-900' };
  if (e.tags.includes('injury-prevention' as ExerciseTag))                 return { bg: 'bg-orange-500', accent: 'text-orange-900' };
  const map: Partial<Record<MuscleGroup, ImgStyle>> = {
    chest:      { bg: 'bg-rose-500',    accent: 'text-rose-900'    },
    back:       { bg: 'bg-sky-500',     accent: 'text-sky-900'     },
    shoulders:  { bg: 'bg-amber-500',   accent: 'text-amber-900'   },
    biceps:     { bg: 'bg-purple-500',  accent: 'text-purple-900'  },
    triceps:    { bg: 'bg-indigo-500',  accent: 'text-indigo-900'  },
    legs:       { bg: 'bg-green-500',   accent: 'text-green-900'   },
    hamstrings: { bg: 'bg-orange-500',  accent: 'text-orange-900'  },
    glutes:     { bg: 'bg-pink-500',    accent: 'text-pink-900'    },
    core:       { bg: 'bg-yellow-500',  accent: 'text-yellow-900'  },
    cardio:     { bg: 'bg-red-500',     accent: 'text-red-900'     },
    'full-body':{ bg: 'bg-violet-500',  accent: 'text-violet-900'  },
    calves:     { bg: 'bg-lime-500',    accent: 'text-lime-900'    },
  };
  return map[e.muscleGroup] ?? { bg: 'bg-teal-500', accent: 'text-teal-900' };
}

/* ── Exercise Card ───────────────────────────────────────────── */
function ExerciseCard({ exercise: ex, onAdd, isAdded, index }: {
  exercise: Exercise; onAdd: () => void; isAdded: boolean; index: number;
}) {
  const diff    = difficultyConfig[ex.difficulty];
  const img     = getImgStyle(ex);
  const keyTags = ex.tags.filter(t => t !== 'strength').slice(0, 2);
  const steps   = ex.instructions.slice(0, 4);
  const tip     = ex.tips[0];
  const cardRef = useRef<HTMLElement>(null);
  const [showPlus, setShowPlus] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const x  = ((e.clientX - r.left)  / r.width  - 0.5) * 2;
    const y  = ((e.clientY - r.top)   / r.height - 0.5) * 2;
    el.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) scale3d(1.015,1.015,1.015)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current; if (!el) return;
    el.style.transform = '';
  }, []);

  const handleAdd = useCallback(() => {
    if (isAdded) return;
    onAdd();
    setShowPlus(true);
    setTimeout(() => setShowPlus(false), 750);
  }, [isAdded, onAdd]);

  return (
    <article ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card card-animate flex flex-col bg-white rounded-2xl overflow-hidden ${
        isAdded ? 'ring-2 ring-teal-400' : ''
      }`}
      style={{
        animationDelay: `${index * 0.055}s`,
        boxShadow: isAdded
          ? '0 0 0 2px #2dd4bf, 0 8px 24px rgba(13,148,136,0.15)'
          : '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
      }}>

      {/* ── IMAGE AREA ── */}
      <div className={`relative h-[140px] ${img.bg} flex flex-col justify-between p-4 overflow-hidden flex-shrink-0`}>

        {/* Subtle wave overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
          <path d="M0 100 Q100 60 200 100 T400 100 L400 160 L0 160Z" fill="white" />
        </svg>

        {/* Tags row */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex gap-1 flex-wrap">
            {keyTags.map(tag => {
              const tc = tagConfig[tag];
              return tc ? (
                <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm">
                  {tc.label}
                </span>
              ) : null;
            })}
          </div>
          <span className={`text-[9px] font-black px-2 py-1 rounded-full bg-white/90 ${diff.text} shadow-sm`}>
            {diff.label}
          </span>
        </div>

        {/* Emoji */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[70px] leading-none select-none opacity-90 drop-shadow-lg">{ex.emoji}</span>
        </div>

        {/* Bottom: muscle group */}
        <div className="relative z-10 flex justify-end">
          <span className="text-[10px] font-bold text-white/80">{muscleLabels[ex.muscleGroup]}</span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Title + equipment */}
        <div>
          <h3 className="font-black text-slate-900 text-[15px] leading-tight mb-1">{ex.name}</h3>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{equipmentIcon[ex.equipment] ?? '🏋️'}</span>
            <span>{equipmentLabel[ex.equipment] ?? ex.equipment}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Steps – always visible */}
        <div>
          <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-2.5">Ausführung</p>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-[11.5px] text-slate-600 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[9px] font-black flex items-center justify-center mt-0.5 border border-teal-100">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tip */}
        {tip && (
          <>
            <div className="border-t border-slate-100" />
            <div className="flex gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 leading-relaxed">
              <span className="flex-shrink-0">💡</span>
              <span>{tip}</span>
            </div>
          </>
        )}

        <div className="flex-1" />

        {/* Add button */}
        <div className="relative">
          {showPlus && (
            <div className="animate-float-up absolute left-1/2 -top-4 -translate-x-1/2 z-20
              text-teal-600 font-black text-xl pointer-events-none select-none">
              +1
            </div>
          )}
          <button onClick={handleAdd} disabled={isAdded}
            className={`w-full py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              isAdded
                ? 'bg-teal-50 text-teal-600 ring-1 ring-teal-200 cursor-default'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-100 hover:scale-[1.02] active:scale-[0.98]'
            }`}>
            {isAdded ? <><Check size={14} /> Hinzugefügt</> : <><Plus size={14} /> Zum Workout hinzufügen</>}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Categories ──────────────────────────────────────────────── */
const CATS: {
  id: CategoryFilter; icon: string; label: string; sub: string;
  activeText: string; activeBg: string; filterFn: (e: Exercise) => boolean;
}[] = [
  { id: 'all',         icon: '🏋️', label: 'Alle Übungen',       sub: 'Komplette Bibliothek', activeText: 'text-teal-700',   activeBg: 'bg-teal-50 border-teal-200',   filterFn: () => true },
  { id: 'football',    icon: '⚽', label: 'Fußball & Athletik', sub: 'Speed & Explosivität', activeText: 'text-teal-700',   activeBg: 'bg-teal-50 border-teal-200',   filterFn: e => e.tags.includes('football') },
  { id: 'injury-ham',  icon: '🦵', label: 'Oberschenkel',       sub: 'Faserriss-Prävention', activeText: 'text-orange-700', activeBg: 'bg-orange-50 border-orange-200',filterFn: e => e.tags.includes('injury-prevention') && ['hamstrings','legs'].includes(e.muscleGroup) },
  { id: 'injury-ank',  icon: '🦶', label: 'Sprunggelenk',       sub: 'Stabilität & Schutz',  activeText: 'text-emerald-700',activeBg: 'bg-emerald-50 border-emerald-200',filterFn: e => e.tags.includes('injury-prevention') && ['ankle','calves'].includes(e.muscleGroup) },
  { id: 'strength',    icon: '💪', label: 'Kraft & Muskeln',    sub: 'Klassisches Training', activeText: 'text-violet-700', activeBg: 'bg-violet-50 border-violet-200', filterFn: e => !e.tags.includes('football') && !e.tags.includes('injury-prevention') },
];

const DIFFS: { id: Difficulty | 'all'; label: string; dot?: string }[] = [
  { id: 'all',          label: 'Alle Level' },
  { id: 'beginner',     label: 'Anfänger',       dot: 'bg-emerald-400' },
  { id: 'intermediate', label: 'Mittel',          dot: 'bg-amber-400' },
  { id: 'advanced',     label: 'Fortgeschritten', dot: 'bg-red-400' },
];

const HERO: Record<CategoryFilter, { headline: string; sub: string; bg: string; text: string }> = {
  all:          { headline: 'Alle Übungen',          sub: 'Die komplette Trainingsbibliothek – von Kraft bis Athletik.',       bg: 'from-teal-600 to-teal-700',     text: 'text-teal-100' },
  football:     { headline: '⚽ Fußball & Athletik',  sub: 'Explosivität, Schnelligkeit und fußballspezifische Athletik.',     bg: 'from-teal-600 to-cyan-700',     text: 'text-teal-100' },
  'injury-ham': { headline: '🦵 Oberschenkel-Schutz', sub: 'Exzentrische Kraft und Verletzungsprävention für den Hamstring.',  bg: 'from-orange-500 to-amber-600',  text: 'text-orange-100' },
  'injury-ank': { headline: '🦶 Sprunggelenk-Schutz', sub: 'Propriozeption und Stabilität für sicheres Training.',             bg: 'from-emerald-600 to-teal-700',  text: 'text-emerald-100' },
  strength:     { headline: '💪 Kraft & Muskeln',     sub: 'Klassisches Krafttraining für jeden Muskel.',                     bg: 'from-violet-600 to-indigo-700', text: 'text-violet-100' },
};

/* ── Main ────────────────────────────────────────────────────── */
export function ExerciseLibrary({ onAddExercise, addedIds }: Props) {
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState<CategoryFilter>('all');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'all'>('all');

  const counts = useMemo(() => {
    const obj = {} as Record<CategoryFilter, number>;
    for (const cat of CATS) obj[cat.id] = exercises.filter(cat.filterFn).length;
    return obj;
  }, []);

  const catDef = CATS.find(c => c.id === category)!;
  const hero   = HERO[category];

  const filtered = useMemo(() => exercises.filter(e => {
    const matchCat    = catDef.filterFn(e);
    const matchSearch = !search
      || e.name.toLowerCase().includes(search.toLowerCase())
      || (muscleLabels[e.muscleGroup] ?? '').toLowerCase().includes(search.toLowerCase());
    const matchDiff   = filterDiff === 'all' || e.difficulty === filterDiff;
    return matchCat && matchSearch && matchDiff;
  }), [search, category, filterDiff, catDef]);

  return (
    <div className="flex gap-6">

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col gap-1 w-[200px] flex-shrink-0">

        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Kategorien</p>

        {CATS.map(cat => {
          const active = category === cat.id;
          return (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                active
                  ? `${cat.activeBg} ${cat.activeText} border`
                  : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm hover:border-slate-200'
              }`}>
              <span className="text-[20px] w-7 flex items-center justify-center flex-shrink-0">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold leading-none mb-0.5 truncate">{cat.label}</div>
                <div className="text-[9px] opacity-60 leading-none">{cat.sub}</div>
              </div>
              <span className={`text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                active ? 'bg-white/60' : 'bg-slate-100 text-slate-400'
              }`}>
                {counts[cat.id]}
              </span>
            </button>
          );
        })}

        <div className="my-3 h-px bg-slate-200" />

        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Schwierigkeit</p>

        {DIFFS.map(d => (
          <button key={d.id} onClick={() => setFilterDiff(d.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left text-[12px] font-semibold transition-all ${
              filterDiff === d.id
                ? 'border-teal-200 bg-teal-50 text-teal-700'
                : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-700 hover:border-slate-200 hover:shadow-sm'
            }`}>
            {d.dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${d.dot}`} />}
            {d.label}
          </button>
        ))}
      </aside>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Hero */}
        <div className={`mb-5 rounded-2xl bg-gradient-to-r ${hero.bg} px-6 py-5 flex items-center justify-between gap-4 shadow-md`}>
          <div>
            <h2 className="text-[22px] font-black text-white tracking-tight mb-1">{hero.headline}</h2>
            <p className={`text-[13px] ${hero.text} leading-relaxed`}>{hero.sub}</p>
          </div>
          <div className="hidden sm:block text-right flex-shrink-0">
            <div className="text-[32px] font-black text-white leading-none">{filtered.length}</div>
            <div className={`text-[11px] ${hero.text}`}>Übungen</div>
          </div>
        </div>

        {/* Search + mobile filter */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Übung oder Muskelgruppe suchen..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.12)] transition-all shadow-sm" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value as CategoryFilter)}
            className="md:hidden text-[12px] px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none shadow-sm cursor-pointer">
            {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-4xl mb-5">🔍</div>
            <p className="text-[16px] text-slate-700 font-bold mb-2">Keine Übungen gefunden</p>
            <p className="text-slate-400 text-sm">Andere Suchbegriffe oder Filter versuchen</p>
          </div>
        ) : (
          <div key={`${category}-${filterDiff}-${search}`} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((ex, i) => (
              <ExerciseCard key={ex.id} exercise={ex} index={i} onAdd={() => onAddExercise(ex)} isAdded={addedIds.has(ex.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
