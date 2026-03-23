import { useState, useCallback } from 'react';
import { Play, ListChecks, Clock, Zap, ChevronRight, Dumbbell, Activity } from 'lucide-react';
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
  const [tab, setTab]           = useState<Tab>('library');
  const [running, setRunning]   = useState(false);
  const [workoutName, setWorkoutName]             = useState('Mein Workout');
  const [workoutExercises, setWorkoutExercises]   = useState<WorkoutExercise[]>([]);

  const addedIds = new Set(workoutExercises.map(w => w.exercise.id));

  const handleAddExercise = useCallback((exercise: Exercise) => {
    if (addedIds.has(exercise.id)) return;
    setWorkoutExercises(prev => [
      ...prev,
      { id: generateId(), exercise, durationSeconds: 60, restSeconds: 30, sets: 3 },
    ]);
  }, [addedIds]);

  const handleUpdate  = useCallback((id: string, changes: Partial<WorkoutExercise>) =>
    setWorkoutExercises(prev => prev.map(w => w.id === id ? { ...w, ...changes } : w)), []);
  const handleRemove  = useCallback((id: string) =>
    setWorkoutExercises(prev => prev.filter(w => w.id !== id)), []);
  const handleReorder = useCallback((from: number, to: number) =>
    setWorkoutExercises(prev => {
      if (to < 0 || to >= prev.length) return prev;
      const arr = [...prev]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return arr;
    }), []);

  const totalSecs = workoutExercises.reduce((a, e) => a + e.durationSeconds + e.restSeconds, 0);
  const totalMin  = Math.round(totalSecs / 60);
  const totalCals = workoutExercises.reduce((a, e) => a + Math.round((e.exercise.calsBurnedPerMin * e.durationSeconds) / 60), 0);

  if (running) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
          <WorkoutRunner exercises={workoutExercises} workoutName={workoutName} onFinish={() => setRunning(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-[60px] flex items-center gap-6">

          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-200">
              <Activity size={16} className="text-white" />
            </div>
            <span className="text-[16px] font-black text-slate-900 tracking-tight">Athleo</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <button onClick={() => setTab('library')}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                tab === 'library'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}>
              Übungsbibliothek
            </button>
            <button onClick={() => setTab('builder')}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all flex items-center gap-1.5 ${
                tab === 'builder'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}>
              Mein Plan
              {workoutExercises.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-black flex items-center justify-center">
                  {workoutExercises.length}
                </span>
              )}
            </button>
          </nav>

          <div className="flex-1" />

          {/* Stats pill */}
          {workoutExercises.length > 0 && (
            <div className="hidden md:flex items-center gap-4 text-[12px] text-slate-500 border border-slate-200 rounded-xl px-4 py-2 bg-slate-50">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <ListChecks size={12} className="text-teal-600" />{workoutExercises.length} Übungen
              </span>
              <span className="w-px h-3 bg-slate-200" />
              <span className="flex items-center gap-1.5 font-semibold">
                <Clock size={12} className="text-teal-600" />{totalMin} min
              </span>
              <span className="w-px h-3 bg-slate-200" />
              <span className="flex items-center gap-1.5 font-semibold">
                <Zap size={12} className="text-orange-500" />{totalCals} kcal
              </span>
            </div>
          )}

          {/* Start */}
          {workoutExercises.length > 0 && (
            <button onClick={() => setRunning(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[13px] font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-teal-200">
              <Play size={13} fill="white" /> Starten
            </button>
          )}
        </div>
      </header>

      {/* ── CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        {tab === 'library' ? (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <ExerciseLibrary onAddExercise={handleAddExercise} addedIds={addedIds} />
            </div>
            <div className="hidden lg:flex flex-col gap-4 w-[320px] flex-shrink-0">
              <WorkoutPanel
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-[24px] font-black text-slate-900 mb-1">Workout Builder</h1>
              <p className="text-slate-500 text-sm">Passe deine Übungen individuell an.</p>
            </div>
            <WorkoutBuilder
              exercises={workoutExercises} workoutName={workoutName}
              onNameChange={setWorkoutName} onUpdate={handleUpdate}
              onRemove={handleRemove} onReorder={handleReorder}
              onStart={() => setRunning(true)} />
          </div>
        )}
      </div>

      {/* Mobile sticky bar */}
      {workoutExercises.length > 0 && tab === 'library' && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 flex gap-2">
          <button onClick={() => setTab('builder')}
            className="flex-1 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
            <ListChecks size={16} className="text-teal-600" /> Plan ({workoutExercises.length})
          </button>
          <button onClick={() => setRunning(true)}
            className="flex-1 py-3.5 rounded-2xl bg-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-200">
            <Play size={16} fill="white" /> Starten
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Workout Side Panel ──────────────────────────────────────── */
function WorkoutPanel({ exercises, onRemove, onStart, onGoToBuilder, totalMin, totalCals }: {
  exercises: WorkoutExercise[];
  onRemove: (id: string) => void;
  onStart: () => void;
  onGoToBuilder: () => void;
  totalMin: number;
  totalCals: number;
}) {
  return (
    <div className="sticky top-[76px] flex flex-col gap-3">

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-600">
          <div>
            <h3 className="text-[13px] font-black text-white">Mein Workout</h3>
            {exercises.length > 0 && (
              <p className="text-[11px] text-teal-100 mt-0.5">{exercises.length} Übungen · {totalMin} min · {totalCals} kcal</p>
            )}
          </div>
          {exercises.length > 0 && (
            <button onClick={onGoToBuilder}
              className="text-[11px] text-teal-100 hover:text-white flex items-center gap-0.5 font-semibold transition-colors">
              Bearbeiten <ChevronRight size={12} />
            </button>
          )}
        </div>

        {exercises.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
              <Dumbbell size={22} className="text-slate-300" />
            </div>
            <p className="text-[13px] text-slate-700 font-semibold mb-1">Noch leer</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">Klick auf <span className="text-teal-600 font-bold">+ Hinzufügen</span> bei einer Übung</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
            {exercises.map((we, i) => (
              <div key={we.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 group transition-colors">
                <span className="text-[11px] text-slate-400 w-4 text-right font-bold">{i + 1}</span>
                <span className="text-lg flex-shrink-0">{we.exercise.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-slate-800 truncate">{we.exercise.name}</p>
                  <p className="text-[10px] text-slate-400">{Math.floor(we.durationSeconds / 60)}:{String(we.durationSeconds % 60).padStart(2,'0')} · {we.restSeconds}s Pause</p>
                </div>
                <button onClick={() => onRemove(we.id)}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center text-xs transition-all">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {exercises.length > 0 && (
        <button onClick={onStart}
          className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-[15px] flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-200">
          <Play size={18} fill="white" /> Workout starten
        </button>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Schnell-Tipps</p>
        <ul className="space-y-2.5">
          {[
            ['⚽', 'Fußball-Tab für Athletik'],
            ['🦵', 'Oberschenkel gegen Faserriss'],
            ['🦶', 'Sprunggelenk & Propriozeption'],
            ['💡', 'Übungen direkt erklären'],
          ].map(([icon, text]) => (
            <li key={text} className="flex gap-2 text-[11px] text-slate-500 leading-relaxed">
              <span>{icon}</span>{text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
