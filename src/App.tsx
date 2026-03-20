import { useState, useCallback } from 'react';
import { Play, BookOpen, ListChecks, Clock, Activity } from 'lucide-react';
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
    setTab('builder');
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

  if (running) {
    return (
      <div className="min-h-screen bg-[#06070f] flex items-center justify-center p-4"
           style={{ background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.07) 0%, #06070f 60%)' }}>
        <div className="w-full max-w-md">
          <WorkoutRunner
            exercises={workoutExercises}
            workoutName={workoutName}
            onFinish={() => setRunning(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070f] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#06070f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30 text-lg">
              ⚡
            </div>
            <div>
              <div className="text-[15px] font-black text-white leading-none tracking-tight">ATHLEO</div>
              <div className="text-[9px] text-slate-500 font-semibold tracking-[0.12em] uppercase leading-none mt-0.5">Football Performance</div>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#0f1120] border border-white/[0.06]">
            <button
              onClick={() => setTab('library')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                tab === 'library'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/30'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <BookOpen size={13} />
              <span className="hidden sm:inline">Übungen</span>
            </button>
            <button
              onClick={() => setTab('builder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                tab === 'builder'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/30'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <ListChecks size={13} />
              <span className="hidden sm:inline">Mein Plan</span>
              {workoutExercises.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center">
                  {workoutExercises.length}
                </span>
              )}
            </button>
          </div>

          {/* Start button (header) */}
          {workoutExercises.length > 0 && (
            <button
              onClick={() => setRunning(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/30"
            >
              <Play size={13} fill="white" />
              Starten
            </button>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">

        {/* Left: tab content */}
        <div className="flex-1 min-w-0">
          <div style={{ height: 'calc(100vh - 130px)' }} className="flex flex-col">
            {tab === 'library' ? (
              <ExerciseLibrary onAddExercise={handleAddExercise} addedIds={addedIds} />
            ) : (
              <WorkoutBuilder
                exercises={workoutExercises}
                workoutName={workoutName}
                onNameChange={setWorkoutName}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                onReorder={handleReorder}
                onStart={() => setRunning(true)}
              />
            )}
          </div>
        </div>

        {/* Right: sidebar (desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">

          {/* Stats card */}
          <div className="rounded-2xl bg-[#0f1120] border border-white/[0.06] p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={12} className="text-violet-400" />
              Workout-Übersicht
            </h3>

            {workoutExercises.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2 opacity-20">📋</div>
                <p className="text-xs text-slate-600">Füge Übungen hinzu</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Big stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-3 rounded-xl bg-[#06070f] border border-white/[0.04]">
                    <div className="text-xl font-black text-violet-400">{workoutExercises.length}</div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">Übungen</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#06070f] border border-white/[0.04]">
                    <div className="text-xl font-black text-sky-400">{totalMin}</div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">Min</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#06070f] border border-white/[0.04]">
                    <div className="text-xl font-black text-amber-400">{totalCals}</div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">kcal</div>
                  </div>
                </div>

                {/* Muscle groups */}
                <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-2">Muskelgruppen</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set(workoutExercises.map((e) => e.exercise.muscleGroup))].map((m) => (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 font-semibold">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Start button */}
          {workoutExercises.length > 0 && (
            <button
              onClick={() => setRunning(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-violet-500/30"
            >
              <Play size={20} fill="white" />
              Workout starten
            </button>
          )}

          {/* Queue preview */}
          {workoutExercises.length > 0 && (
            <div className="rounded-2xl bg-[#0f1120] border border-white/[0.06] p-4">
              <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Clock size={10} />
                Reihenfolge
              </h3>
              <div className="space-y-1.5">
                {workoutExercises.map((w, i) => (
                  <div key={w.id} className="flex items-center gap-2.5 py-1">
                    <span className="text-[10px] text-slate-600 w-4 text-right font-semibold">{i + 1}</span>
                    <span className="text-sm">{w.exercise.emoji}</span>
                    <span className="text-xs text-slate-300 flex-1 truncate font-medium">{w.exercise.name}</span>
                    <span className="text-[10px] text-violet-400 font-bold">
                      {Math.floor(w.durationSeconds / 60)}:{String(w.durationSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="rounded-2xl bg-[#0f1120] border border-white/[0.06] p-4">
            <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">💡 So geht's</h3>
            <ul className="space-y-2 text-[11px] text-slate-500 leading-relaxed">
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">⚽</span>Fußball-Tab für sportspezifische Übungen</li>
              <li className="flex gap-2"><span className="text-orange-400 flex-shrink-0">🦵</span>Oberschenkel-Schutz gegen Faserrisse</li>
              <li className="flex gap-2"><span className="text-teal-400 flex-shrink-0">🦶</span>Sprunggelenk-Schutz für Stabilität</li>
              <li className="flex gap-2"><span className="text-violet-400 flex-shrink-0">→</span>Übung anklicken für Anleitung & Tipps</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Mobile floating start button ── */}
      {workoutExercises.length > 0 && tab === 'builder' && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setRunning(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-base flex items-center justify-center gap-3 shadow-2xl shadow-violet-500/40"
          >
            <Play size={20} fill="white" />
            Workout starten
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
