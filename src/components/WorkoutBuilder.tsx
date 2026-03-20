import { useState } from 'react';
import { Trash2, GripVertical, Play, Timer, ChevronUp, ChevronDown, Zap, RotateCcw } from 'lucide-react';
import type { WorkoutExercise } from '../types';

interface Props {
  exercises: WorkoutExercise[];
  workoutName: string;
  onNameChange: (name: string) => void;
  onUpdate: (id: string, changes: Partial<WorkoutExercise>) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onStart: () => void;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}min` : `${m}min ${s}s`;
}

function ExerciseRow({
  we,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  we: WorkoutExercise;
  index: number;
  total: number;
  onUpdate: (changes: Partial<WorkoutExercise>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-[#111118] border border-white/5 overflow-hidden transition-all duration-300 hover:border-purple-500/20">
      {/* Color bar */}
      <div className="h-0.5 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500" />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center gap-3">
          {/* Drag handle & order */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <button onClick={onMoveUp} disabled={index === 0} className="p-0.5 text-slate-600 hover:text-purple-400 disabled:opacity-20 transition-colors">
              <ChevronUp size={14} />
            </button>
            <span className="text-xs font-bold text-slate-600 w-5 text-center">{index + 1}</span>
            <button onClick={onMoveDown} disabled={index === total - 1} className="p-0.5 text-slate-600 hover:text-purple-400 disabled:opacity-20 transition-colors">
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Emoji */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/10 flex items-center justify-center text-lg flex-shrink-0">
            {we.exercise.emoji}
          </div>

          {/* Name + quick stats */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">{we.exercise.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-purple-400 flex items-center gap-1">
                <Timer size={10} />
                {formatTime(we.durationSeconds)}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <RotateCcw size={10} />
                Pause: {formatTime(we.restSeconds)}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <Zap size={10} />
                {Math.round((we.exercise.calsBurnedPerMin * we.durationSeconds) / 60)} kcal
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setOpen(!open)}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 flex items-center justify-center transition-all"
            >
              <GripVertical size={14} />
            </button>
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Expandable settings */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left mt-3 text-xs text-slate-600 hover:text-purple-400 transition-colors flex items-center gap-1"
        >
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          Einstellungen {open ? 'schließen' : 'öffnen'}
        </button>

        {open && (
          <div className="mt-4 space-y-4 animate-slide-up">
            {/* Duration */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Timer size={12} className="text-purple-400" />
                  Dauer
                </label>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg">
                  {formatTime(we.durationSeconds)}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={600}
                step={5}
                value={we.durationSeconds}
                onChange={(e) => onUpdate({ durationSeconds: Number(e.target.value) })}
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>10s</span>
                <span>5min</span>
                <span>10min</span>
              </div>
            </div>

            {/* Rest */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <RotateCcw size={12} className="text-slate-400" />
                  Pause danach
                </label>
                <span className="text-xs font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">
                  {formatTime(we.restSeconds)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={300}
                step={5}
                value={we.restSeconds}
                onChange={(e) => onUpdate({ restSeconds: Number(e.target.value) })}
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>0s</span>
                <span>2.5min</span>
                <span>5min</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getTotalStats(exercises: WorkoutExercise[]) {
  const totalSecs = exercises.reduce((acc, e) => acc + e.durationSeconds + e.restSeconds, 0);
  const totalCals = exercises.reduce(
    (acc, e) => acc + Math.round((e.exercise.calsBurnedPerMin * e.durationSeconds) / 60),
    0
  );
  return { totalSecs, totalCals };
}

export function WorkoutBuilder({ exercises, workoutName, onNameChange, onUpdate, onRemove, onReorder, onStart }: Props) {
  const { totalSecs, totalCals } = getTotalStats(exercises);
  const totalMin = Math.floor(totalSecs / 60);
  const totalSecRem = totalSecs % 60;

  return (
    <div className="flex flex-col h-full">
      {/* Workout name */}
      <div className="mb-4">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Workout Name..."
          className="w-full px-4 py-3 rounded-xl bg-[#1a1a25] border border-white/5 text-white font-semibold text-lg placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {exercises.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/10 flex items-center justify-center text-3xl mb-4">
            💪
          </div>
          <p className="text-slate-400 text-sm font-medium">Noch keine Übungen</p>
          <p className="text-slate-600 text-xs mt-1">Füge Übungen aus der Bibliothek hinzu</p>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-violet-500/5 border border-purple-500/10">
            <div className="flex-1 text-center">
              <p className="text-xs text-slate-500">Übungen</p>
              <p className="text-lg font-bold text-white">{exercises.length}</p>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex-1 text-center">
              <p className="text-xs text-slate-500">Gesamtdauer</p>
              <p className="text-lg font-bold text-purple-400">
                {totalMin}:{String(totalSecRem).padStart(2, '0')}
              </p>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex-1 text-center">
              <p className="text-xs text-slate-500">Kalorien</p>
              <p className="text-lg font-bold text-amber-400">{totalCals}</p>
            </div>
          </div>

          {/* Exercise list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {exercises.map((we, index) => (
              <ExerciseRow
                key={we.id}
                we={we}
                index={index}
                total={exercises.length}
                onUpdate={(changes) => onUpdate(we.id, changes)}
                onRemove={() => onRemove(we.id)}
                onMoveUp={() => onReorder(index, index - 1)}
                onMoveDown={() => onReorder(index, index + 1)}
              />
            ))}
          </div>

          {/* Start button */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <button
              onClick={onStart}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25 animate-glow"
            >
              <Play size={22} fill="white" />
              Workout starten
            </button>
          </div>
        </>
      )}
    </div>
  );
}
