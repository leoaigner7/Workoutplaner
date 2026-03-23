import { useState, useMemo } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Check } from 'lucide-react';
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

const difficultyConfig: Record<Difficulty, { label: string; color: string; dot: string }> = {
  beginner:     { label: 'Anfänger',       color: 'text-emerald-400', dot: 'bg-emerald-400' },
  intermediate: { label: 'Mittel',          color: 'text-amber-400',  dot: 'bg-amber-400'  },
  advanced:     { label: 'Fortgeschritten', color: 'text-red-400',    dot: 'bg-red-400'    },
};

const equipmentLabel: Record<string, string> = {
  none: 'Kein Equipment', dumbbells: 'Kurzhanteln', barbell: 'Langhantel',
  kettlebell: 'Kettlebell', 'resistance-band': 'Widerstandsband',
  'pull-up-bar': 'Klimmzugstange', bench: 'Bank', machine: 'Maschine',
  cable: 'Kabelzug', 'foam-roller': 'Foam Roller', 'balance-board': 'Bosu-Board',
};

const tagConfig: Record<ExerciseTag, { label: string; style: string }> = {
  football:        { label: '⚽ Fußball',      style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  'injury-prevention': { label: '🛡️ Verletzungspr.', style: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  eccentric:       { label: 'Exzentrisch',     style: 'bg-red-500/15 text-red-400 border-red-500/25' },
  plyometric:      { label: 'Plyometrisch',    style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  proprioception:  { label: 'Propriozeption',  style: 'bg-pink-500/15 text-pink-400 border-pink-500/25' },
  strength:        { label: 'Kraft',           style: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  mobility:        { label: 'Mobilität',       style: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' },
  stability:       { label: 'Stabilität',      style: 'bg-teal-500/15 text-teal-400 border-teal-500/25' },
};

/* Card header gradient per category */
function cardGradient(e: Exercise): string {
  if (e.tags.includes('football')) return 'from-cyan-900/80 via-sky-900/60 to-[#0c0e1a]';
  if (e.muscleGroup === 'ankle')   return 'from-teal-900/80 via-emerald-900/60 to-[#0c0e1a]';
  if (e.muscleGroup === 'hamstrings' || (e.tags.includes('injury-prevention') && e.muscleGroup !== 'ankle' as MuscleGroup))
    return 'from-orange-900/80 via-amber-900/60 to-[#0c0e1a]';
  const map: Partial<Record<MuscleGroup, string>> = {
    chest: 'from-rose-900/80 via-pink-900/60 to-[#0c0e1a]',
    back:  'from-blue-900/80 via-sky-900/60 to-[#0c0e1a]',
    shoulders: 'from-amber-900/80 via-orange-900/60 to-[#0c0e1a]',
    biceps: 'from-purple-900/80 via-violet-900/60 to-[#0c0e1a]',
    triceps: 'from-indigo-900/80 via-blue-900/60 to-[#0c0e1a]',
    legs: 'from-emerald-900/80 via-green-900/60 to-[#0c0e1a]',
    glutes: 'from-pink-900/80 via-rose-900/60 to-[#0c0e1a]',
    core: 'from-yellow-900/80 via-amber-900/60 to-[#0c0e1a]',
    cardio: 'from-red-900/80 via-orange-900/60 to-[#0c0e1a]',
    'full-body': 'from-violet-900/80 via-purple-900/60 to-[#0c0e1a]',
  };
  return map[e.muscleGroup] ?? 'from-violet-900/70 via-purple-900/50 to-[#0c0e1a]';
}

function emojiGlow(e: Exercise): string {
  if (e.tags.includes('football'))           return 'drop-shadow(0 0 16px rgba(6,182,212,0.5))';
  if (e.muscleGroup === 'ankle')             return 'drop-shadow(0 0 16px rgba(16,185,129,0.5))';
  if (e.tags.includes('injury-prevention'))  return 'drop-shadow(0 0 16px rgba(249,115,22,0.5))';
  return 'drop-shadow(0 0 16px rgba(139,92,246,0.4))';
}

/* ── Exercise Card ────────────────────────────────────────────── */
function ExerciseCard({ exercise: ex, onAdd, isAdded }: { exercise: Exercise; onAdd: () => void; isAdded: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const diff = difficultyConfig[ex.difficulty];
  const gradient = cardGradient(ex);
  const glow = emojiGlow(ex);
  const keyTags = ex.tags.filter(t => t !== 'strength').slice(0, 2);

  return (
    <div className={`rounded-2xl bg-[#0c0e1a] border transition-all duration-300 overflow-hidden flex flex-col group ${
      isAdded ? 'border-violet-500/40' : 'border-white/[0.06] hover:border-white/[0.14] hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-0.5'
    }`}>

      {/* Card visual header */}
      <div className={`relative h-[120px] bg-gradient-to-b ${gradient} flex items-center justify-center flex-shrink-0`}>

        {/* Top left: category tags */}
        {keyTags.length > 0 && (
          <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
            {keyTags.map(tag => (
              <span key={tag} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${tagConfig[tag]?.style}`}>
                {tagConfig[tag]?.label}
              </span>
            ))}
          </div>
        )}

        {/* Top right: difficulty */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
          <span className={`text-[9px] font-bold ${diff.color}`}>{diff.label}</span>
        </div>

        {/* Big emoji */}
        <span className="text-[56px] leading-none" style={{ filter: glow }}>
          {ex.emoji}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-white text-[14px] leading-snug flex-1">{ex.name}</h3>
          <button onClick={onAdd} disabled={isAdded}
            className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isAdded
                ? 'bg-violet-500/20 text-violet-400 cursor-default'
                : 'bg-violet-600 hover:bg-violet-500 text-white hover:scale-110 active:scale-95 shadow-lg shadow-violet-500/25'
            }`}>
            {isAdded ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">
          {ex.description}
        </p>

        {/* Footer meta */}
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <span className="font-medium">{muscleLabels[ex.muscleGroup]}</span>
          <span>{equipmentLabel[ex.equipment] ?? ex.equipment}</span>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-[10px] text-slate-600 hover:text-violet-400 transition-colors pt-3 border-t border-white/[0.05]">
          {expanded ? <><ChevronUp size={10} /> Weniger</> : <><ChevronDown size={10} /> Anleitung & Tipps</>}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/[0.05] space-y-3">
            <div>
              <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-2">Ausführung</p>
              <ol className="space-y-1.5">
                {ex.instructions.map((step, i) => (
                  <li key={i} className="flex gap-2 text-[11px] text-slate-400 leading-relaxed">
                    <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-violet-500/15 text-violet-400 flex items-center justify-center font-bold text-[8px] mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            {ex.tips.length > 0 && (
              <div>
                <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">Tipps</p>
                <ul className="space-y-1.5">
                  {ex.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-[11px] text-slate-400 leading-relaxed">
                      <span className="flex-shrink-0 text-amber-400">💡</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Category sidebar items ─────────────────────────────────── */
type CategoryFilter2 = CategoryFilter;
const CATS: { id: CategoryFilter2; icon: string; label: string; color: string; filterFn: (e: Exercise) => boolean }[] = [
  { id: 'all',        icon: '🏋️', label: 'Alle Übungen',         color: 'violet',  filterFn: () => true },
  { id: 'football',   icon: '⚽', label: 'Fußball & Athletik',   color: 'cyan',    filterFn: e => e.tags.includes('football') },
  { id: 'injury-ham', icon: '🦵', label: 'Oberschenkel-Schutz',  color: 'orange',  filterFn: e => e.tags.includes('injury-prevention') && ['hamstrings','legs'].includes(e.muscleGroup) },
  { id: 'injury-ank', icon: '🦶', label: 'Sprunggelenk-Schutz', color: 'teal',    filterFn: e => e.tags.includes('injury-prevention') && ['ankle','calves'].includes(e.muscleGroup) },
  { id: 'strength',   icon: '💪', label: 'Kraft & Muskeln',      color: 'violet',  filterFn: e => !e.tags.includes('football') && !e.tags.includes('injury-prevention') },
];

const catActiveStyle: Record<string, string> = {
  violet: 'bg-violet-600/20 border-violet-500/40 text-violet-300',
  cyan:   'bg-cyan-600/20 border-cyan-500/40 text-cyan-300',
  orange: 'bg-orange-600/20 border-orange-500/40 text-orange-300',
  teal:   'bg-teal-600/20 border-teal-500/40 text-teal-300',
};

const DIFFS: { id: Difficulty | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle Level' },
  { id: 'beginner', label: 'Anfänger' },
  { id: 'intermediate', label: 'Mittel' },
  { id: 'advanced', label: 'Fortgeschritten' },
];

/* ── Main Component ──────────────────────────────────────────── */
export function ExerciseLibrary({ onAddExercise, addedIds }: Props) {
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState<CategoryFilter>('all');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'all'>('all');

  const counts = useMemo(() => {
    const obj = {} as Record<CategoryFilter, number>;
    for (const cat of CATS) obj[cat.id] = exercises.filter(cat.filterFn).length;
    return obj;
  }, []);

  const catDef = CATS.find(c => c.id === category)!;

  const filtered = useMemo(() => exercises.filter(e => {
    const matchCat    = catDef.filterFn(e);
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || (muscleLabels[e.muscleGroup] ?? '').toLowerCase().includes(search.toLowerCase());
    const matchDiff   = filterDiff === 'all' || e.difficulty === filterDiff;
    return matchCat && matchSearch && matchDiff;
  }), [search, category, filterDiff, catDef]);

  return (
    <div className="flex gap-6">

      {/* ── LEFT SIDEBAR ────────────────────────────── */}
      <aside className="hidden md:flex flex-col gap-1 w-52 flex-shrink-0 pt-1">

        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mb-2">Kategorien</p>

        {CATS.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
              category === cat.id
                ? catActiveStyle[cat.color]
                : 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
            }`}>
            <span className="text-base">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-semibold leading-none block">{cat.label}</span>
            </div>
            <span className="text-[10px] text-slate-600 font-semibold">{counts[cat.id]}</span>
          </button>
        ))}

        <div className="my-3 border-t border-white/[0.05]" />

        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mb-2">Level</p>
        {DIFFS.map(d => (
          <button key={d.id} onClick={() => setFilterDiff(d.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all text-[12px] font-semibold ${
              filterDiff === d.id
                ? 'border-violet-500/30 bg-violet-600/10 text-violet-300'
                : 'border-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'
            }`}>
            {d.label}
          </button>
        ))}
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Search bar + mobile filters */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Übung suchen..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c0e1a] border border-white/[0.07] text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.10)] transition-all" />
          </div>
          {/* Mobile category select */}
          <select value={category} onChange={e => setCategory(e.target.value as CategoryFilter)}
            className="md:hidden text-[12px] px-3 py-2 rounded-xl bg-[#0c0e1a] border border-white/[0.07] text-slate-300 focus:outline-none cursor-pointer">
            {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>

        {/* Result headline */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[18px] font-black text-white tracking-tight">{catDef.label}</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">{filtered.length} Übungen</p>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4 opacity-20">🔍</div>
            <p className="text-slate-400 font-semibold mb-1">Keine Übungen gefunden</p>
            <p className="text-slate-600 text-sm">Andere Suchbegriffe oder Filter versuchen</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} onAdd={() => onAddExercise(ex)} isAdded={addedIds.has(ex.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
