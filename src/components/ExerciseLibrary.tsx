import { useState, useMemo } from 'react';
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
  beginner:     { label: 'Anfänger',       bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  intermediate: { label: 'Mittel',          bg: 'bg-amber-500/20',  text: 'text-amber-300'  },
  advanced:     { label: 'Fortgeschritten', bg: 'bg-red-500/20',    text: 'text-red-300'    },
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

const tagConfig: Record<ExerciseTag, { label: string; style: string }> = {
  football:            { label: '⚽ Fußball',          style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  'injury-prevention': { label: '🛡️ Verletzungspr.',   style: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  eccentric:           { label: '📉 Exzentrisch',      style: 'bg-red-500/20 text-red-300 border-red-500/30' },
  plyometric:          { label: '⚡ Plyometrisch',     style: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  proprioception:      { label: '🎯 Propriozeption',   style: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  strength:            { label: '💪 Kraft',            style: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  mobility:            { label: '🧘 Mobilität',        style: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  stability:           { label: '🏔️ Stabilität',      style: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
};

/* Card accent colour per exercise */
type AccentCfg = { from: string; via: string; accent: string; glow: string; ring: string };
function getAccent(e: Exercise): AccentCfg {
  if (e.tags.includes('football'))
    return { from: 'from-cyan-500/30',   via: 'via-sky-600/20',   accent: 'text-cyan-300',   glow: 'rgba(6,182,212,0.55)',   ring: 'ring-cyan-500/40' };
  if (e.muscleGroup === 'ankle')
    return { from: 'from-teal-500/30',   via: 'via-emerald-600/20', accent: 'text-teal-300',  glow: 'rgba(20,184,166,0.55)',  ring: 'ring-teal-500/40' };
  if (e.tags.includes('injury-prevention'))
    return { from: 'from-orange-500/30', via: 'via-amber-600/20', accent: 'text-orange-300',  glow: 'rgba(249,115,22,0.55)',  ring: 'ring-orange-500/40' };
  const byMuscle: Partial<Record<MuscleGroup, AccentCfg>> = {
    chest:      { from: 'from-rose-500/30',   via: 'via-pink-600/20',    accent: 'text-rose-300',   glow: 'rgba(244,63,94,0.55)',   ring: 'ring-rose-500/40' },
    back:       { from: 'from-sky-500/30',    via: 'via-blue-600/20',    accent: 'text-sky-300',    glow: 'rgba(14,165,233,0.55)',  ring: 'ring-sky-500/40' },
    shoulders:  { from: 'from-amber-500/30',  via: 'via-yellow-600/20',  accent: 'text-amber-300',  glow: 'rgba(245,158,11,0.55)',  ring: 'ring-amber-500/40' },
    biceps:     { from: 'from-purple-500/30', via: 'via-violet-600/20',  accent: 'text-purple-300', glow: 'rgba(168,85,247,0.55)',  ring: 'ring-purple-500/40' },
    triceps:    { from: 'from-indigo-500/30', via: 'via-blue-600/20',    accent: 'text-indigo-300', glow: 'rgba(99,102,241,0.55)',  ring: 'ring-indigo-500/40' },
    legs:       { from: 'from-emerald-500/30',via: 'via-green-600/20',   accent: 'text-emerald-300',glow: 'rgba(16,185,129,0.55)',  ring: 'ring-emerald-500/40' },
    hamstrings: { from: 'from-orange-500/30', via: 'via-amber-600/20',   accent: 'text-orange-300', glow: 'rgba(249,115,22,0.55)',  ring: 'ring-orange-500/40' },
    glutes:     { from: 'from-pink-500/30',   via: 'via-rose-600/20',    accent: 'text-pink-300',   glow: 'rgba(236,72,153,0.55)',  ring: 'ring-pink-500/40' },
    core:       { from: 'from-yellow-500/30', via: 'via-amber-600/20',   accent: 'text-yellow-300', glow: 'rgba(234,179,8,0.55)',   ring: 'ring-yellow-500/40' },
    cardio:     { from: 'from-red-500/30',    via: 'via-orange-600/20',  accent: 'text-red-300',    glow: 'rgba(239,68,68,0.55)',   ring: 'ring-red-500/40' },
    'full-body':{ from: 'from-violet-500/30', via: 'via-purple-600/20',  accent: 'text-violet-300', glow: 'rgba(139,92,246,0.55)',  ring: 'ring-violet-500/40' },
    calves:     { from: 'from-lime-500/30',   via: 'via-green-600/20',   accent: 'text-lime-300',   glow: 'rgba(132,204,22,0.55)',  ring: 'ring-lime-500/40' },
  };
  return byMuscle[e.muscleGroup] ?? { from: 'from-violet-500/30', via: 'via-purple-600/20', accent: 'text-violet-300', glow: 'rgba(139,92,246,0.55)', ring: 'ring-violet-500/40' };
}

/* ── Exercise Card ────────────────────────────────────────────── */
function ExerciseCard({ exercise: ex, onAdd, isAdded }: { exercise: Exercise; onAdd: () => void; isAdded: boolean }) {
  const diff   = difficultyConfig[ex.difficulty];
  const accent = getAccent(ex);
  const keyTags = ex.tags.filter(t => t !== 'strength').slice(0, 2);
  const steps  = ex.instructions.slice(0, 4);
  const tip    = ex.tips[0];

  return (
    <article className={`flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 group ${
      isAdded
        ? `border-violet-500/50 shadow-lg shadow-violet-500/10 bg-[#0d0f1e]`
        : `border-white/[0.07] bg-[#0c0e1a] hover:border-white/[0.18] hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5`
    }`}>

      {/* ── VISUAL HEADER ── */}
      <div className={`relative h-[130px] bg-gradient-to-b ${accent.from} ${accent.via} to-[#0c0e1a] flex flex-col justify-between px-4 pt-3 pb-0 overflow-hidden flex-shrink-0`}>

        {/* Background subtle noise texture (pure CSS) */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        {/* Top row: tags + difficulty */}
        <div className="flex items-start justify-between gap-2 relative z-10">
          <div className="flex gap-1 flex-wrap">
            {keyTags.map(tag => (
              <span key={tag} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${tagConfig[tag]?.style}`}>
                {tagConfig[tag]?.label}
              </span>
            ))}
          </div>
          <span className={`flex-shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full ${diff.bg} ${diff.text}`}>
            {diff.label}
          </span>
        </div>

        {/* Big emoji centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[64px] leading-none select-none"
            style={{ filter: `drop-shadow(0 0 20px ${accent.glow}) drop-shadow(0 0 40px ${accent.glow.replace('0.55', '0.25')})` }}>
            {ex.emoji}
          </span>
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="flex flex-col flex-1 px-4 pt-4 pb-4 gap-3">

        {/* Title + muscle */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-black text-white text-[15px] leading-tight tracking-tight">{ex.name}</h3>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className={`font-bold ${accent.accent}`}>{muscleLabels[ex.muscleGroup]}</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500 flex items-center gap-1">
              <span>{equipmentIcon[ex.equipment] ?? '🏋️'}</span>
              {equipmentLabel[ex.equipment] ?? ex.equipment}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.05]" />

        {/* Instructions – always visible */}
        <div>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${accent.accent}`}>Ausführung</p>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-[11px] text-slate-300 leading-relaxed">
                <span className={`flex-shrink-0 w-4 h-4 rounded-full border text-[8px] font-black flex items-center justify-center mt-0.5 ${accent.ring} ring-1 ring-inset ${accent.accent} bg-transparent`}
                  style={{ boxShadow: `0 0 6px ${accent.glow.replace('0.55', '0.2')}` }}>
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
            <div className="border-t border-white/[0.05]" />
            <div className="flex gap-2 text-[11px] text-slate-400 leading-relaxed bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2.5">
              <span className="flex-shrink-0 mt-0.5">💡</span>
              <span>{tip}</span>
            </div>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add button */}
        <button onClick={onAdd} disabled={isAdded}
          className={`w-full py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            isAdded
              ? 'bg-violet-500/15 text-violet-400 cursor-default ring-1 ring-violet-500/30'
              : `bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]`
          }`}
          style={!isAdded ? { boxShadow: '0 4px 20px rgba(139,92,246,0.3)' } : {}}>
          {isAdded ? <><Check size={13} /> Hinzugefügt</> : <><Plus size={13} /> Zum Workout hinzufügen</>}
        </button>
      </div>
    </article>
  );
}

/* ── Category sidebar ─────────────────────────────────────────── */
const CATS: {
  id: CategoryFilter; icon: string; label: string; sublabel: string;
  accentActive: string; filterFn: (e: Exercise) => boolean;
}[] = [
  { id: 'all',        icon: '🏋️', label: 'Alle Übungen',        sublabel: 'Komplette Bibliothek', accentActive: 'border-violet-500/40 bg-violet-600/10 text-violet-200', filterFn: () => true },
  { id: 'football',   icon: '⚽', label: 'Fußball & Athletik',  sublabel: 'Speed, Explosivität',  accentActive: 'border-cyan-500/40 bg-cyan-600/10 text-cyan-200',   filterFn: e => e.tags.includes('football') },
  { id: 'injury-ham', icon: '🦵', label: 'Oberschenkel',        sublabel: 'Faserriss-Prävention', accentActive: 'border-orange-500/40 bg-orange-600/10 text-orange-200', filterFn: e => e.tags.includes('injury-prevention') && ['hamstrings','legs'].includes(e.muscleGroup) },
  { id: 'injury-ank', icon: '🦶', label: 'Sprunggelenk',        sublabel: 'Stabilität & Schutz',  accentActive: 'border-teal-500/40 bg-teal-600/10 text-teal-200',   filterFn: e => e.tags.includes('injury-prevention') && ['ankle','calves'].includes(e.muscleGroup) },
  { id: 'strength',   icon: '💪', label: 'Kraft & Muskeln',     sublabel: 'Klassisches Training', accentActive: 'border-violet-500/40 bg-violet-600/10 text-violet-200', filterFn: e => !e.tags.includes('football') && !e.tags.includes('injury-prevention') },
];

const DIFFS: { id: Difficulty | 'all'; label: string; dot?: string }[] = [
  { id: 'all',          label: 'Alle Level' },
  { id: 'beginner',     label: 'Anfänger',       dot: 'bg-emerald-400' },
  { id: 'intermediate', label: 'Mittel',          dot: 'bg-amber-400' },
  { id: 'advanced',     label: 'Fortgeschritten', dot: 'bg-red-400' },
];

/* ── Hero banner for category ────────────────────────────────── */
const HERO: Record<CategoryFilter, { headline: string; sub: string; color: string }> = {
  all:        { headline: 'Alle Übungen',         sub: 'Die komplette Trainingsbibliothek – von Kraft bis Athletik.',    color: 'from-violet-600/20 via-purple-600/10' },
  football:   { headline: '⚽ Fußball & Athletik',  sub: 'Explosivität, Schnelligkeit und fußballspezifische Athletik.',  color: 'from-cyan-600/20 via-sky-600/10' },
  'injury-ham':{ headline: '🦵 Oberschenkel-Schutz',sub: 'Exzentrische Kraft und Verletzungsprävention für den Hamstring.', color: 'from-orange-600/20 via-amber-600/10' },
  'injury-ank':{ headline: '🦶 Sprunggelenk-Schutz',sub: 'Propriozeption und Stabilität für sicheres Training.',           color: 'from-teal-600/20 via-emerald-600/10' },
  strength:   { headline: '💪 Kraft & Muskeln',     sub: 'Klassisches Krafttraining für jeden Muskel.',                   color: 'from-violet-600/20 via-indigo-600/10' },
};

/* ── Main ──────────────────────────────────────────────────────── */
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
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase())
      || (muscleLabels[e.muscleGroup] ?? '').toLowerCase().includes(search.toLowerCase());
    const matchDiff   = filterDiff === 'all' || e.difficulty === filterDiff;
    return matchCat && matchSearch && matchDiff;
  }), [search, category, filterDiff, catDef]);

  return (
    <div className="flex gap-8">

      {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
      <aside className="hidden md:flex flex-col gap-0.5 w-[210px] flex-shrink-0 pt-0.5">

        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 mb-3">Kategorien</p>

        {CATS.map(cat => {
          const active = category === cat.id;
          return (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                active ? cat.accentActive + ' border' : 'border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
              }`}>
              <span className="text-[18px] w-6 flex items-center justify-center flex-shrink-0">{cat.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold leading-none mb-0.5 truncate">{cat.label}</div>
                <div className="text-[9px] text-slate-600 leading-none">{cat.sublabel}</div>
              </div>
              <span className={`text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ${active ? 'bg-white/10 text-white' : 'text-slate-700'}`}>
                {counts[cat.id]}
              </span>
            </button>
          );
        })}

        <div className="my-3 border-t border-white/[0.05]" />

        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 mb-3">Schwierigkeit</p>

        {DIFFS.map(d => (
          <button key={d.id} onClick={() => setFilterDiff(d.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all text-[12px] font-semibold ${
              filterDiff === d.id
                ? 'border-violet-500/30 bg-violet-600/10 text-violet-300'
                : 'border-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'
            }`}>
            {d.dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${d.dot}`} />}
            {d.label}
          </button>
        ))}
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Hero banner */}
        <div className={`mb-5 rounded-2xl bg-gradient-to-r ${hero.color} to-transparent border border-white/[0.06] px-6 py-5 flex items-center justify-between gap-4`}>
          <div>
            <h2 className="text-[22px] font-black text-white tracking-tight mb-1">{hero.headline}</h2>
            <p className="text-[13px] text-slate-400 leading-relaxed">{hero.sub}</p>
          </div>
          <div className="flex-shrink-0 text-[11px] text-slate-500 text-right hidden sm:block">
            <div className="text-[28px] font-black text-white leading-none">{filtered.length}</div>
            <div>Übungen</div>
          </div>
        </div>

        {/* Search + mobile filter */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input type="text" placeholder="Übung oder Muskelgruppe suchen..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c0e1a] border border-white/[0.07] text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value as CategoryFilter)}
            className="md:hidden text-[12px] px-3 py-2 rounded-xl bg-[#0c0e1a] border border-white/[0.07] text-slate-300 focus:outline-none cursor-pointer">
            {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-4xl mb-5 opacity-40">🔍</div>
            <p className="text-[16px] text-slate-300 font-bold mb-2">Keine Übungen gefunden</p>
            <p className="text-slate-600 text-sm">Andere Suchbegriffe oder Filter versuchen</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} onAdd={() => onAddExercise(ex)} isAdded={addedIds.has(ex.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
