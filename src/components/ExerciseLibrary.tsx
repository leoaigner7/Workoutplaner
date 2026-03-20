import { useState, useMemo } from 'react';
import { Search, Plus, ChevronDown, ChevronUp, Zap, Clock, Dumbbell } from 'lucide-react';
import { exercises } from '../data/exercises';
import type { Exercise, MuscleGroup, Difficulty } from '../types';

interface Props {
  onAddExercise: (exercise: Exercise) => void;
  addedIds: Set<string>;
}

const muscleLabels: Record<MuscleGroup, string> = {
  chest: 'Brust',
  back: 'Rücken',
  shoulders: 'Schultern',
  biceps: 'Bizeps',
  triceps: 'Trizeps',
  legs: 'Beine',
  glutes: 'Gesäß',
  core: 'Core',
  cardio: 'Cardio',
  'full-body': 'Ganzkörper',
};

const muscleColors: Record<MuscleGroup, string> = {
  chest: 'from-rose-500 to-pink-600',
  back: 'from-blue-500 to-cyan-600',
  shoulders: 'from-amber-500 to-orange-600',
  biceps: 'from-purple-500 to-violet-600',
  triceps: 'from-indigo-500 to-blue-600',
  legs: 'from-emerald-500 to-green-600',
  glutes: 'from-pink-500 to-rose-600',
  core: 'from-yellow-500 to-amber-600',
  cardio: 'from-red-500 to-orange-600',
  'full-body': 'from-violet-500 to-purple-600',
};

const difficultyConfig: Record<Difficulty, { label: string; color: string }> = {
  beginner: { label: 'Anfänger', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  intermediate: { label: 'Mittel', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  advanced: { label: 'Fortgeschritten', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

const equipmentLabel: Record<string, string> = {
  none: 'Kein Equipment',
  dumbbells: 'Kurzhanteln',
  barbell: 'Langhantel',
  kettlebell: 'Kettlebell',
  'resistance-band': 'Widerstandsband',
  'pull-up-bar': 'Klimmzugstange',
  bench: 'Bank',
  machine: 'Maschine',
  cable: 'Kabel',
};

function ExerciseCard({ exercise, onAdd, isAdded }: { exercise: Exercise; onAdd: () => void; isAdded: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const diff = difficultyConfig[exercise.difficulty];
  const gradient = muscleColors[exercise.muscleGroup];

  return (
    <div className="animate-slide-up rounded-2xl overflow-hidden border border-white/5 bg-[#111118] hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
      {/* Header */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
              {exercise.emoji}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm leading-tight">{exercise.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs text-slate-400">{muscleLabels[exercise.muscleGroup]}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className={`text-xs px-1.5 py-0.5 rounded-md border ${diff.color} font-medium`}>{diff.label}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onAdd}
            disabled={isAdded}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isAdded
                ? 'bg-purple-500/20 text-purple-400 cursor-default'
                : 'bg-purple-600 hover:bg-purple-500 text-white hover:scale-110 active:scale-95 shadow-lg shadow-purple-500/20'
            }`}
          >
            {isAdded ? '✓' : <Plus size={16} />}
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-2">{exercise.description}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Zap size={11} className="text-amber-400" />
            <span>{exercise.calsBurnedPerMin} kcal/min</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Dumbbell size={11} className="text-purple-400" />
            <span>{equipmentLabel[exercise.equipment]}</span>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-400 mt-3 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Weniger' : 'Anleitung anzeigen'}
        </button>

        {/* Expanded instructions */}
        {expanded && (
          <div className="mt-3 space-y-3 animate-slide-up">
            <div>
              <p className="text-xs font-semibold text-purple-400 mb-1.5 uppercase tracking-wider">Ausführung</p>
              <ol className="space-y-1">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-400">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            {exercise.tips.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-1.5 uppercase tracking-wider">Tipps</p>
                <ul className="space-y-1">
                  {exercise.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-amber-400 flex-shrink-0">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {exercise.secondaryMuscles.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500">Sekundär:</span>
                {exercise.secondaryMuscles.map((m) => (
                  <span key={m} className="text-xs px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400">
                    {muscleLabels[m]}
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

const allMuscles: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'core', 'cardio', 'full-body'];
const allDifficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export function ExerciseLibrary({ onAddExercise, addedIds }: Props) {
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'all'>('all');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'all'>('all');

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchSearch =
        search === '' ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        muscleLabels[e.muscleGroup].toLowerCase().includes(search.toLowerCase());
      const matchMuscle = filterMuscle === 'all' || e.muscleGroup === filterMuscle;
      const matchDiff = filterDiff === 'all' || e.difficulty === filterDiff;
      return matchSearch && matchMuscle && matchDiff;
    });
  }, [search, filterMuscle, filterDiff]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Übung suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1a1a25] border border-white/5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <select
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value as MuscleGroup | 'all')}
          className="flex-shrink-0 text-xs px-3 py-2 rounded-xl bg-[#1a1a25] border border-white/5 text-slate-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="all">Alle Muskeln</option>
          {allMuscles.map((m) => (
            <option key={m} value={m}>{muscleLabels[m]}</option>
          ))}
        </select>
        <select
          value={filterDiff}
          onChange={(e) => setFilterDiff(e.target.value as Difficulty | 'all')}
          className="flex-shrink-0 text-xs px-3 py-2 rounded-xl bg-[#1a1a25] border border-white/5 text-slate-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
        >
          <option value="all">Alle Level</option>
          {allDifficulties.map((d) => (
            <option key={d} value={d}>{difficultyConfig[d].label}</option>
          ))}
        </select>
        <div className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-500 ml-auto">
          <Clock size={11} />
          <span>{filtered.length} Übungen</span>
        </div>
      </div>

      {/* Exercise grid */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Keine Übungen gefunden</p>
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
