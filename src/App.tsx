import { useState, useCallback } from 'react';
import { Dumbbell, ListChecks, Play, BookOpen, Flame } from 'lucide-react';
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
      {
        id: generateId(),
        exercise,
        durationSeconds: 60,
        restSeconds: 30,
        sets: 3,
      },
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
  const totalMin = Math.round(totalSecs / 60);

  if (running) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Dumbbell size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-none">WorkoutPlaner</h1>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">Build. Train. Conquer.</p>
            </div>
          </div>
          {workoutExercises.length > 0 && (
            <button
              onClick={() => setRunning(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
            >
              <Play size={14} fill="white" />
              Starten
            </button>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">

        {/* Left: Library / Builder tabs */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-xl bg-[#111118] border border-white/5 mb-5">
            <button
              onClick={() => setTab('library')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'library'
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <BookOpen size={15} />
              Übungen
            </button>
            <button
              onClick={() => setTab('builder')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'builder'
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ListChecks size={15} />
              Mein Plan
              {workoutExercises.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-black flex items-center justify-center">
                  {workoutExercises.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
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

        {/* Right: Sidebar (desktop only) */}
        <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
          {/* Quick stats card */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-900/40 to-violet-900/20 border border-purple-500/20 p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              Workout-Übersicht
            </h3>
            {workoutExercises.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Füge Übungen hinzu um die Statistiken zu sehen
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Übungen</span>
                  <span className="text-sm font-bold text-white">{workoutExercises.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Gesamtdauer</span>
                  <span className="text-sm font-bold text-purple-400">{totalMin} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Kalorien (est.)</span>
                  <span className="text-sm font-bold text-amber-400">
                    {workoutExercises.reduce(
                      (acc, e) => acc + Math.round((e.exercise.calsBurnedPerMin * e.durationSeconds) / 60),
                      0
                    )} kcal
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">Muskelgruppen</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set(workoutExercises.map((e) => e.exercise.muscleGroup))].map((m) => (
                      <span key={m} className="text-xs px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Start workout button */}
          {workoutExercises.length > 0 && (
            <button
              onClick={() => setRunning(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-purple-500/30 animate-glow"
            >
              <Play size={20} fill="white" />
              Workout starten
            </button>
          )}

          {/* Exercise queue preview */}
          {workoutExercises.length > 0 && (
            <div className="rounded-2xl bg-[#111118] border border-white/5 p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Reihenfolge</h3>
              <div className="space-y-2">
                {workoutExercises.map((w, i) => (
                  <div key={w.id} className="flex items-center gap-2.5">
                    <span className="text-xs text-slate-600 w-4 text-right">{i + 1}</span>
                    <span className="text-sm">{w.exercise.emoji}</span>
                    <span className="text-xs text-slate-300 flex-1 truncate">{w.exercise.name}</span>
                    <span className="text-xs text-purple-400">
                      {Math.floor(w.durationSeconds / 60)}:{String(w.durationSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="rounded-2xl bg-[#111118] border border-white/5 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">💡 Tipps</h3>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex gap-2"><span className="text-purple-400">→</span>Klicke auf eine Übung für Details & Anleitung</li>
              <li className="flex gap-2"><span className="text-purple-400">→</span>Dauer und Pause sind individuell einstellbar</li>
              <li className="flex gap-2"><span className="text-purple-400">→</span>Übungen per Pfeile umsortieren</li>
              <li className="flex gap-2"><span className="text-purple-400">→</span>Ton-Signale beim Workout-Start</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile start button */}
      {workoutExercises.length > 0 && tab === 'builder' && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setRunning(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/40 animate-glow"
          >
            <Play size={22} fill="white" />
            Workout starten
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
