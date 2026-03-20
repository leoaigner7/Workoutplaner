import { useState } from 'react';
import { Trash2, Play, Timer, ChevronUp, ChevronDown, Zap, RotateCcw, Pencil } from 'lucide-react';
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

function fmt(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m}min` : `${m}:${String(r).padStart(2,'0')}`;
}

function ExerciseRow({
  we, index, total, onUpdate, onRemove, onMoveUp, onMoveDown,
}: {
  we: WorkoutExercise; index: number; total: number;
  onUpdate: (changes: Partial<WorkoutExercise>) => void;
  onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(false);
  const kcal = Math.round((we.exercise.calsBurnedPerMin * we.durationSeconds) / 60);

  return (
    <div className="rounded-2xl bg-[#0f1120] border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all duration-200">
      <div className="h-[2px] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-60" />

      <div className="p-3.5">
        <div className="flex items-center gap-3">
          {/* Order arrows */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button onClick={onMoveUp} disabled={index === 0}
              className="p-0.5 text-slate-700 hover:text-violet-400 disabled:opacity-20 transition-colors">
              <ChevronUp size={13} />
            </button>
            <span className="text-[10px] font-black text-slate-600 text-center w-5">{index + 1}</span>
            <button onClick={onMoveDown} disabled={index === total - 1}
              className="p-0.5 text-slate-700 hover:text-violet-400 disabled:opacity-20 transition-colors">
              <ChevronDown size={13} />
            </button>
          </div>

          {/* Emoji */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 border border-violet-500/10 flex items-center justify-center text-lg flex-shrink-0">
            {we.exercise.emoji}
          </div>

          {/* Name & stats */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{we.exercise.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-violet-400 font-semibold flex items-center gap-1">
                <Timer size={9} />
                {fmt(we.durationSeconds)}
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <RotateCcw size={9} />
                {fmt(we.restSeconds)} Pause
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-[11px] text-amber-500 flex items-center gap-1">
                <Zap size={9} />
                {kcal} kcal
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => setOpen(!open)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all text-xs ${
                open ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-slate-500 hover:bg-white/8 hover:text-slate-300'
              }`}>
              <Pencil size={12} />
            </button>
            <button onClick={onRemove}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/15 text-slate-500 hover:text-red-400 flex items-center justify-center transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {open && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-4">
            {/* Duration slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Timer size={11} className="text-violet-400" />
                  Dauer
                </label>
                <span className="text-[11px] font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg">
                  {fmt(we.durationSeconds)}
                </span>
              </div>
              <input type="range" min={10} max={600} step={5} value={we.durationSeconds}
                onChange={(e) => onUpdate({ durationSeconds: Number(e.target.value) })} />
              <div className="flex justify-between text-[9px] text-slate-700 mt-1">
                <span>10s</span><span>5min</span><span>10min</span>
              </div>
            </div>

            {/* Rest slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <RotateCcw size={11} className="text-slate-500" />
                  Pause danach
                </label>
                <span className="text-[11px] font-black text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">
                  {fmt(we.restSeconds)}
                </span>
              </div>
              <input type="range" min={0} max={300} step={5} value={we.restSeconds}
                onChange={(e) => onUpdate({ restSeconds: Number(e.target.value) })} />
              <div className="flex justify-between text-[9px] text-slate-700 mt-1">
                <span>0s</span><span>2.5min</span><span>5min</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkoutBuilder({ exercises, workoutName, onNameChange, onUpdate, onRemove, onReorder, onStart }: Props) {
  const totalSecs = exercises.reduce((a, e) => a + e.durationSeconds + e.restSeconds, 0);
  const totalCals = exercises.reduce((a, e) => a + Math.round((e.exercise.calsBurnedPerMin * e.durationSeconds) / 60), 0);
  const totalMin  = Math.floor(totalSecs / 60);
  const totalSecR = totalSecs % 60;

  return (
    <div className="flex flex-col h-full gap-4">

      {/* Name input */}
      <div className="relative">
        <Pencil size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          value={workoutName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Workout Name..."
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0f1120] border border-white/[0.06] text-white font-bold text-base placeholder-slate-600 focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
        />
      </div>

      {exercises.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/10 flex items-center justify-center text-4xl mb-4">
            📋
          </div>
          <p className="text-slate-300 text-sm font-bold mb-1">Workout ist leer</p>
          <p className="text-slate-600 text-xs">Füge Übungen aus der Bibliothek hinzu</p>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 rounded-xl bg-[#0f1120] border border-white/[0.06]">
              <div className="text-lg font-black text-violet-400">{exercises.length}</div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Übungen</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#0f1120] border border-white/[0.06]">
              <div className="text-lg font-black text-sky-400">{totalMin}:{String(totalSecR).padStart(2,'0')}</div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Dauer</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#0f1120] border border-white/[0.06]">
              <div className="text-lg font-black text-amber-400">{totalCals}</div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">kcal</div>
            </div>
          </div>

          {/* Exercise list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
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
          <div className="border-t border-white/5 pt-4">
            <button
              onClick={onStart}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-violet-500/25"
            >
              <Play size={20} fill="white" />
              Workout starten
            </button>
          </div>
        </>
      )}
    </div>
  );
}
