import { useState, useCallback } from 'react';
import { Play, ListChecks, Clock, Zap, ChevronRight, Dumbbell } from 'lucide-react';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutBuilder } from './components/WorkoutBuilder';
import { WorkoutRunner } from './components/WorkoutRunner';
import type { Exercise, WorkoutExercise } from './types';
import './index.css';

type Tab = 'library' | 'builder';

function generateId() {
  return Math.random().toString(36).slice(2);
}

function App() {
  const [tab, setTab] = useState<Tab>('library');
  const [running, setRunning] = useState(false);
  const [workoutName, setWorkoutName] = useState('Mein Workout');
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);

  const addedIds = new Set(workoutExercises.map((w) => w.exercise.id));

  const handleAddExercise = useCallback((exercise: Exercise) => {
    if (addedIds.has(exercise.id)) return;
    setWorkoutExercises((prev) => [
      ...prev,
      { id: generateId(), exercise, durationSeconds: 60, restSeconds: 30, sets: 3 },
    ]);
  }, [addedIds]);

  const handleUpdate = useCallback((id: string, changes: Partial<WorkoutExercise>) => {
    setWorkoutExercises((prev) => prev.map((w) => (w.id === id ? { ...w, ...changes } : w)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setWorkoutExercises((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleReorder = useCallback((from: number, to: number) => {
    setWorkoutExercises((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }, []);

  const totalSecs = workoutExercises.reduce((a, e) => a + e.durationSeconds + e.restSeconds, 0);
  const totalMin  = Math.round(totalSecs / 60);
  const totalCals = workoutExercises.reduce((a, e) => a + Math.round((e.exercise.calsBurnedPerMin * e.durationSeconds) / 60), 0);

  /* ── Runner fullscreen ── */
  if (running) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.10) 0%, #06070f 55%), #06070f' }}>
        <div className="w-full max-w-lg bg-[#0c0e1a] rounded-3xl border border-white/[0.07] shadow-2xl overflow-hidden p-6">
          <WorkoutRunner exercises={workoutExercises} workoutName={workoutName} onFinish={() => setRunning(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070f] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#06070f]/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-[60px] flex items-center gap-8">

          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-sm shadow-lg shadow-violet-500/30">⚡</div>
            <span className="text-[15px] font-black text-white tracking-tight">ATHLEO</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <button onClick={() => setTab('library')}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${tab === 'library' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              Übungen
            </button>
            <button onClick={() => setTab('builder')}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1.5 ${tab === 'builder' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              Mein Plan
              {workoutExercises.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-black flex items-center justify-center">
                  {workoutExercises.length}
                </span>
              )}
            </button>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Workout stats pill */}
          {workoutExercises.length > 0 && (
            <div className="hidden md:flex items-center gap-4 text-[12px] text-slate-400 border border-white/[0.07] rounded-xl px-4 py-2 bg-white/[0.03]">
              <span className="flex items-center gap-1.5"><ListChecks size={12} className="text-violet-400" />{workoutExercises.length} Übungen</span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5"><Clock size={12} className="text-sky-400" />{totalMin} min</span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5"><Zap size={12} className="text-amber-400" />{totalCals} kcal</span>
            </div>
          )}

          {/* Start button */}
          {workoutExercises.length > 0 && (
            <button onClick={() => setRunning(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-[13px] font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25 flex-shrink-0">
              <Play size={13} fill="white" />
              Starten
            </button>
          )}
        </div>
      </header>

      {/* ══ CONTENT ═════════════════════════════════════════════════════════ */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        {tab === 'library' ? (
          /* ── LIBRARY: side-by-side on desktop ── */
          <div className="flex gap-6">
            {/* Exercise grid */}
            <div className="flex-1 min-w-0">
              <ExerciseLibrary onAddExercise={handleAddExercise} addedIds={addedIds} />
            </div>

            {/* Workout panel (desktop sidebar) */}
            <div className="hidden lg:flex flex-col gap-4 w-[340px] flex-shrink-0">
              <WorkoutSidePanel
                exercises={workoutExercises}
                onRemove={handleRemove}
                onStart={() => setRunning(true)}
                onGoToBuilder={() => setTab('builder')}
                totalMin={totalMin}
                totalCals={totalCals}
              />
            </div>
          </div>
        ) : (
          /* ── BUILDER ── */
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-white tracking-tight mb-1">Workout Builder</h1>
              <p className="text-slate-400 text-sm">Passe deine Übungen individuell an und starte das Workout.</p>
            </div>
            <WorkoutBuilder
              exercises={workoutExercises}
              workoutName={workoutName}
              onNameChange={setWorkoutName}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              onReorder={handleReorder}
              onStart={() => setRunning(true)}
            />
          </div>
        )}
      </div>

      {/* Mobile add-to-workout sticky button */}
      {workoutExercises.length > 0 && tab === 'library' && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 flex gap-2">
          <button onClick={() => setTab('builder')}
            className="flex-1 py-3.5 rounded-2xl bg-[#111220] border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2">
            <ListChecks size={16} />
            Plan ({workoutExercises.length})
          </button>
          <button onClick={() => setRunning(true)}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-violet-500/30">
            <Play size={16} fill="white" />
            Starten
          </button>
        </div>
      )}
    </div>
  );
}

/* ══ WORKOUT SIDE PANEL (desktop sidebar in library view) ════════════════════ */
function WorkoutSidePanel({
  exercises, onRemove, onStart, onGoToBuilder, totalMin, totalCals
}: {
  exercises: WorkoutExercise[];
  onRemove: (id: string) => void;
  onStart: () => void;
  onGoToBuilder: () => void;
  totalMin: number;
  totalCals: number;
}) {
  return (
    <div className="sticky top-[76px] flex flex-col gap-3">

      {/* Panel header */}
      <div className="rounded-2xl bg-[#0c0e1a] border border-white/[0.07] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-black text-white">Mein Workout</h3>
            {exercises.length > 0 && (
              <p className="text-[11px] text-slate-500 mt-0.5">{exercises.length} Übungen · {totalMin} min · {totalCals} kcal</p>
            )}
          </div>
          {exercises.length > 0 && (
            <button onClick={onGoToBuilder}
              className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5 transition-colors font-semibold">
              Bearbeiten <ChevronRight size={12} />
            </button>
          )}
        </div>

        {exercises.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-2xl mx-auto mb-3">
              <Dumbbell size={22} className="text-slate-600" />
            </div>
            <p className="text-[13px] text-slate-400 font-semibold mb-1">Noch leer</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">Klick auf <span className="text-violet-400">+</span> bei einer Übung um sie hinzuzufügen</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-[420px] overflow-y-auto">
            {exercises.map((we, i) => (
              <div key={we.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] group transition-colors">
                <span className="text-[11px] text-slate-600 w-4 text-right flex-shrink-0 font-semibold">{i + 1}</span>
                <span className="text-base flex-shrink-0">{we.exercise.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-white truncate">{we.exercise.name}</p>
                  <p className="text-[10px] text-slate-500">{Math.floor(we.durationSeconds / 60)}:{String(we.durationSeconds % 60).padStart(2,'0')} · {we.restSeconds}s Pause</p>
                </div>
                <button onClick={() => onRemove(we.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-lg leading-none flex-shrink-0">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start button */}
      {exercises.length > 0 && (
        <button onClick={onStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-[15px] flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-violet-500/25">
          <Play size={18} fill="white" />
          Workout starten
        </button>
      )}

      {/* Tips */}
      <div className="rounded-2xl bg-[#0c0e1a] border border-white/[0.07] p-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Tipps</p>
        <ul className="space-y-2">
          {[
            ['⚽', 'Fußball-Tab für Athletik-Übungen'],
            ['🦵', 'Oberschenkel-Schutz gegen Faserrisse'],
            ['🦶', 'Sprunggelenk-Schutz & Propriozeption'],
            ['💡', 'Übung anklicken für Anleitung'],
          ].map(([icon, text]) => (
            <li key={text} className="flex gap-2 text-[11px] text-slate-500 leading-relaxed">
              <span className="flex-shrink-0">{icon}</span>{text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
