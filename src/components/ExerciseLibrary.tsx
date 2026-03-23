import { useState, useMemo } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Zap, Dumbbell } from 'lucide-react';
import { exercises } from '../data/exercises';
import type { Exercise, MuscleGroup, Difficulty, ExerciseTag } from '../types';

interface Props {
  onAddExercise: (exercise: Exercise) => void;
  addedIds: Set<string>;
}

type CategoryFilter = 'all' | 'football' | 'injury-ham' | 'injury-ank' | 'strength';

const muscleLabels: Record<MuscleGroup, string> = {
  chest: 'Brust',
  back: 'Rücken',
  shoulders: 'Schultern',
  biceps: 'Bizeps',
  triceps: 'Trizeps',
  legs: 'Beine',
  hamstrings: 'Oberschenkel',
  calves: 'Waden',
  glutes: 'Gesäß',
  core: 'Core',
  cardio: 'Cardio',
  'full-body': 'Ganzkörper',
  ankle: 'Sprunggelenk',
};

const muscleColors: Record<MuscleGroup, string> = {
  chest: 'from-rose-500 to-pink-600',
  back: 'from-blue-500 to-cyan-600',
  shoulders: 'from-amber-500 to-orange-600',
  biceps: 'from-purple-500 to-violet-600',
  triceps: 'from-indigo-500 to-blue-600',
  legs: 'from-emerald-500 to-green-600',
  hamstrings: 'from-orange-500 to-amber-600',
  calves: 'from-teal-500 to-cyan-600',
  glutes: 'from-pink-500 to-rose-600',
  core: 'from-yellow-500 to-amber-600',
  cardio: 'from-red-500 to-orange-600',
  'full-body': 'from-violet-500 to-purple-600',
  ankle: 'from-teal-400 to-emerald-500',
};

const difficultyConfig: Record<Difficulty, { label: string; color: string }> = {
  beginner:     { label: 'Anfänger',       color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  intermediate: { label: 'Mittel',          color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  advanced:     { label: 'Fortgeschritten', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

const equipmentLabel: Record<string, string> = {
  none:              'Kein Equipment',
  dumbbells:         'Kurzhanteln',
  barbell:           'Langhantel',
  kettlebell:        'Kettlebell',
  'resistance-band': 'Widerstandsband',
  'pull-up-bar':     'Klimmzugstange',
  bench:             'Bank',
  machine:           'Maschine',
  cable:             'Kabelzug',
  'foam-roller':     'Foam Roller',
  'balance-board':   'Bosu / Balance-Board',
};

const tagConfig: Record<ExerciseTag, { label: string; style: string }> = {
  football:        { label: '⚽ Fußball',     style: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' },
  'injury-prevention': { label: '🛡️ Verletzungspr.', style: 'bg-orange-500/10 text-orange-400 border border-orange-500/25' },
  eccentric:       { label: '🔃 Exzentrisch', style: 'bg-red-500/10 text-red-400 border border-red-500/25' },
  plyometric:      { label: '⚡ Plyometrisch', style: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25' },
  proprioception:  { label: '🎯 Propriozeption', style: 'bg-pink-500/10 text-pink-400 border border-pink-500/25' },
  strength:        { label: '💪 Kraft',        style: 'bg-violet-500/10 text-violet-400 border border-violet-500/25' },
  mobility:        { label: '🧘 Mobilität',    style: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' },
  stability:       { label: '⚖️ Stabilität',   style: 'bg-teal-500/10 text-teal-400 border border-teal-500/25' },
};

const categoryDefs: {
  id: CategoryFilter;
  label: string;
  icon: string;
  filterFn: (e: Exercise) => boolean;
  activeStyle: string;
}[] = [
  {
    id: 'all',
    label: 'Alle',
    icon: '🏋️',
    filterFn: () => true,
    activeStyle: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25',
  },
  {
    id: 'football',
    label: 'Fußball',
    icon: '⚽',
    filterFn: (e) => e.tags.includes('football'),
    activeStyle: 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-500/25',
  },
  {
    id: 'injury-ham',
    label: 'Oberschenkel-Schutz',
    icon: '🦵',
    filterFn: (e) => e.tags.includes('injury-prevention') && (e.muscleGroup === 'hamstrings' || e.muscleGroup === 'legs'),
    activeStyle: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/25',
  },
  {
    id: 'injury-ank',
    label: 'Sprunggelenk-Schutz',
    icon: '🦶',
    filterFn: (e) => e.tags.includes('injury-prevention') && (e.muscleGroup === 'ankle' || e.muscleGroup === 'calves'),
    activeStyle: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25',
  },
  {
    id: 'strength',
    label: 'Kraft & Muskeln',
    icon: '💪',
    filterFn: (e) => !e.tags.includes('football') && !e.tags.includes('injury-prevention'),
    activeStyle: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25',
  },
];

// Card left border color per category
function getCardAccent(e: Exercise): string {
  if (e.tags.includes('football'))           return 'from-cyan-500 to-sky-600';
  if (e.muscleGroup === 'ankle')             return 'from-teal-400 to-emerald-500';
  if (e.muscleGroup === 'hamstrings')        return 'from-orange-500 to-amber-500';
  if (e.tags.includes('injury-prevention'))  return 'from-orange-500 to-amber-500';
  return muscleColors[e.muscleGroup] || 'from-violet-500 to-purple-600';
}

function ExerciseCard({ exercise: ex, onAdd, isAdded }: { exercise: Exercise; onAdd: () => void; isAdded: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const diff = difficultyConfig[ex.difficulty];
  const accent = getCardAccent(ex);

  // Show relevant tags (max 3 to keep clean)
  const displayTags = ex.tags.filter(t => t !== 'strength').slice(0, 3);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0f1120] hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 group">
      {/* Top accent line */}
      <div className={`h-[3px] bg-gradient-to-r ${accent}`} />

      <div className="p-4">
        {/* Main row */}
        <div className="flex items-start gap-3">
          {/* Emoji */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg opacity-90`}>
            {ex.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-[15px] leading-tight truncate">{ex.name}</h3>

            {/* Tag pills */}
            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {displayTags.map(tag => (
                  <span key={tag} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${tagConfig[tag]?.style}`}>
                    {tagConfig[tag]?.label ?? tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">{muscleLabels[ex.muscleGroup]}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold ${diff.color}`}>{diff.label}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Zap size={9} className="text-amber-500" />
                {ex.calsBurnedPerMin} kcal/min
              </span>
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={onAdd}
            disabled={isAdded}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 font-bold text-sm ${
              isAdded
                ? 'bg-violet-500/15 text-violet-400 cursor-default'
                : 'bg-violet-600 hover:bg-violet-500 text-white hover:scale-110 active:scale-95 shadow-lg shadow-violet-500/20'
            }`}
          >
            {isAdded ? '✓' : <Plus size={16} />}
          </button>
        </div>

        {/* Description */}
        <p className="text-[12px] text-slate-400 mt-3 leading-relaxed line-clamp-2">{ex.description}</p>

        {/* Equipment row */}
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
          <Dumbbell size={10} className="text-slate-600" />
          <span>{equipmentLabel[ex.equipment] ?? ex.equipment}</span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-violet-400 mt-3 transition-colors"
        >
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {expanded ? 'Weniger anzeigen' : 'Anleitung & Tipps'}
        </button>

        {/* Expanded */}
        {expanded && (
          <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
            <div>
              <p className="text-[10px] font-bold text-violet-400 mb-2 uppercase tracking-widest">Ausführung</p>
              <ol className="space-y-1.5">
                {ex.instructions.map((step, i) => (
                  <li key={i} className="flex gap-2 text-[12px] text-slate-400 leading-relaxed">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-violet-500/15 text-violet-400 flex items-center justify-center font-bold text-[9px] mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {ex.tips.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-amber-400 mb-2 uppercase tracking-widest">Tipps</p>
                <ul className="space-y-1.5">
                  {ex.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-slate-400 leading-relaxed">
                      <span className="text-amber-400 flex-shrink-0">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ex.secondaryMuscles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-600">Auch:</span>
                {ex.secondaryMuscles.map((m) => (
                  <span key={m} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-500">
                    {muscleLabels[m] ?? m}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExerciseLibrary({ onAddExercise, addedIds }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'all'>('all');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'all'>('all');

  const catDef = categoryDefs.find(c => c.id === category)!;

  const counts = useMemo(() => {
    const obj: Record<CategoryFilter, number> = { all: 0, football: 0, 'injury-ham': 0, 'injury-ank': 0, strength: 0 };
    for (const cat of categoryDefs) {
      obj[cat.id] = exercises.filter(cat.filterFn).length;
    }
    return obj;
  }, []);

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchCat  = catDef.filterFn(e);
      const matchSearch = search === '' || e.name.toLowerCase().includes(search.toLowerCase()) || (muscleLabels[e.muscleGroup] ?? '').toLowerCase().includes(search.toLowerCase());
      const matchMuscle = filterMuscle === 'all' || e.muscleGroup === filterMuscle;
      const matchDiff   = filterDiff === 'all' || e.difficulty === filterDiff;
      return matchCat && matchSearch && matchMuscle && matchDiff;
    });
  }, [search, category, filterMuscle, filterDiff, catDef]);

  return (
    <div className="flex flex-col h-full gap-3">

      {/* ── Category tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categoryDefs.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCategory(cat.id); setFilterMuscle('all'); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              category === cat.id
                ? `${cat.activeStyle} border-transparent`
                : 'bg-[#0f1120] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              category === cat.id ? 'bg-white/20' : 'bg-white/5 text-slate-500'
            }`}>
              {counts[cat.id]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Übung suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0f1120] border border-white/5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all"
          />
        </div>
        <select
          value={filterDiff}
          onChange={(e) => setFilterDiff(e.target.value as Difficulty | 'all')}
          className="text-xs px-3 py-2 rounded-xl bg-[#0f1120] border border-white/5 text-slate-300 focus:outline-none focus:border-violet-500/40 cursor-pointer"
        >
          <option value="all">Alle Level</option>
          <option value="beginner">Anfänger</option>
          <option value="intermediate">Mittel</option>
          <option value="advanced">Fortgeschritten</option>
        </select>
      </div>

      {/* ── Result count ── */}
      <div className="text-[11px] text-slate-600 font-medium">
        {filtered.length} Übung{filtered.length !== 1 ? 'en' : ''} gefunden
      </div>

      {/* ── Exercise list ── */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-3 opacity-30">🔍</div>
            <p className="text-sm font-medium">Keine Übungen gefunden</p>
            <p className="text-xs text-slate-600 mt-1">Andere Suchbegriffe oder Filter versuchen</p>
          </div>
        ) : (
          filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onAdd={() => onAddExercise(exercise)}
              isAdded={addedIds.has(exercise.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
