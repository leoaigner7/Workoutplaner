import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, X, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import type { WorkoutExercise } from '../types';

interface Props {
  exercises: WorkoutExercise[];
  workoutName: string;
  onFinish: () => void;
}

type Phase = 'exercise' | 'rest' | 'countdown' | 'done';

interface RunnerState {
  exerciseIndex: number;
  phase: Phase;
  timeLeft: number;
}

function CircularTimer({
  value,
  max,
  phase,
  children,
}: {
  value: number;
  max: number;
  phase: Phase;
  children: React.ReactNode;
}) {
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? value / max : 0;
  const dashOffset = circumference * (1 - progress);

  const ringColor =
    phase === 'rest'
      ? '#64748b'
      : phase === 'countdown'
      ? '#f59e0b'
      : '#8b5cf6';

  const glowColor =
    phase === 'rest'
      ? 'rgba(100,116,139,0.3)'
      : phase === 'countdown'
      ? 'rgba(245,158,11,0.4)'
      : 'rgba(139,92,246,0.4)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      <svg width="260" height="260" className="absolute inset-0 -rotate-90">
        {/* Background ring */}
        <circle cx="130" cy="130" r={radius} fill="none" stroke="#1a1a25" strokeWidth="12" />
        {/* Progress ring */}
        <circle
          cx="130"
          cy="130"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function useBeep() {
  const ctx = useRef<AudioContext | null>(null);
  const muted = useRef(false);

  const getCtx = () => {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctx.current;
  };

  const beep = useCallback((freq = 880, duration = 0.1, vol = 0.3) => {
    if (muted.current) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch {}
  }, []);

  const setMuted = (v: boolean) => { muted.current = v; };
  return { beep, setMuted, getMuted: () => muted.current };
}

export function WorkoutRunner({ exercises, workoutName, onFinish }: Props) {
  const [state, setState] = useState<RunnerState>({
    exerciseIndex: 0,
    phase: 'countdown',
    timeLeft: 3,
  });
  const [running, setRunning] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const { beep, setMuted } = useBeep();

  const currentExercise = exercises[state.exerciseIndex];
  const nextExercise = exercises[state.exerciseIndex + 1];

  const getMaxTime = (s: RunnerState) => {
    if (s.phase === 'countdown') return 3;
    if (s.phase === 'exercise') return exercises[s.exerciseIndex].durationSeconds;
    if (s.phase === 'rest') return exercises[s.exerciseIndex].restSeconds;
    return 0;
  };

  const advance = useCallback((s: RunnerState): RunnerState => {
    if (s.phase === 'countdown') {
      return { ...s, phase: 'exercise', timeLeft: exercises[s.exerciseIndex].durationSeconds };
    }
    if (s.phase === 'exercise') {
      const restTime = exercises[s.exerciseIndex].restSeconds;
      if (restTime > 0) {
        return { ...s, phase: 'rest', timeLeft: restTime };
      }
      // No rest – go to next exercise or done
      const nextIndex = s.exerciseIndex + 1;
      if (nextIndex >= exercises.length) return { ...s, phase: 'done', timeLeft: 0 };
      return { exerciseIndex: nextIndex, phase: 'countdown', timeLeft: 3 };
    }
    if (s.phase === 'rest') {
      const nextIndex = s.exerciseIndex + 1;
      if (nextIndex >= exercises.length) return { ...s, phase: 'done', timeLeft: 0 };
      return { exerciseIndex: nextIndex, phase: 'countdown', timeLeft: 3 };
    }
    return s;
  }, [exercises]);

  useEffect(() => {
    if (!running || state.phase === 'done') return;
    const interval = setInterval(() => {
      setState((prev) => {
        const next = prev.timeLeft - 1;
        // Sound cues
        if (next === 3 || next === 2 || next === 1) beep(660, 0.12);
        if (next <= 0) {
          beep(prev.phase === 'exercise' ? 440 : 880, 0.2, 0.5);
          return advance(prev);
        }
        return { ...prev, timeLeft: next };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, state.phase, advance, beep]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setMuted(!next);
  };

  const skip = () => {
    setState((prev) => advance({ ...prev, timeLeft: 0 }));
  };

  const restart = () => {
    setState({ exerciseIndex: 0, phase: 'countdown', timeLeft: 3 });
    setRunning(true);
  };

  const totalDone = exercises
    .slice(0, state.exerciseIndex)
    .reduce((a, e) => a + e.durationSeconds + e.restSeconds, 0);

  const totalAll = exercises.reduce((a, e) => a + e.durationSeconds + e.restSeconds, 0);
  const overallProgress = totalAll > 0 ? totalDone / totalAll : 0;

  const totalCals = exercises.reduce(
    (acc, e) => acc + Math.round((e.exercise.calsBurnedPerMin * e.durationSeconds) / 60),
    0
  );

  if (state.phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-slide-up">
        {/* Fireworks / Done */}
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-6xl mb-6 shadow-2xl shadow-purple-500/40 animate-glow">
          🏆
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Workout abgeschlossen!</h1>
        <p className="text-slate-400 mb-8">Hammer Leistung! Du hast es durchgehalten.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
          <div className="rounded-2xl bg-[#1a1a25] border border-white/5 p-4 text-center">
            <p className="text-2xl font-black text-purple-400">{exercises.length}</p>
            <p className="text-xs text-slate-500 mt-1">Übungen</p>
          </div>
          <div className="rounded-2xl bg-[#1a1a25] border border-white/5 p-4 text-center">
            <p className="text-2xl font-black text-amber-400">{totalCals}</p>
            <p className="text-xs text-slate-500 mt-1">Kalorien</p>
          </div>
          <div className="rounded-2xl bg-[#1a1a25] border border-white/5 p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">{Math.round(totalAll / 60)}'</p>
            <p className="text-xs text-slate-500 mt-1">Minuten</p>
          </div>
        </div>

        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={restart}
            className="flex-1 py-3.5 rounded-xl bg-[#1a1a25] border border-white/5 text-white font-semibold flex items-center justify-center gap-2 hover:border-purple-500/30 transition-all"
          >
            <RotateCcw size={16} />
            Nochmal
          </button>
          <button
            onClick={onFinish}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold flex items-center justify-center gap-2 hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25"
          >
            <CheckCircle size={16} />
            Fertig
          </button>
        </div>
      </div>
    );
  }

  const maxTime = getMaxTime(state);
  const phaseLabel =
    state.phase === 'countdown' ? 'BEREIT MACHEN' : state.phase === 'exercise' ? 'ÜBUNG' : 'PAUSE';
  const phaseColor =
    state.phase === 'countdown'
      ? 'text-amber-400'
      : state.phase === 'exercise'
      ? 'text-purple-400'
      : 'text-slate-400';

  const mins = Math.floor(state.timeLeft / 60);
  const secs = state.timeLeft % 60;
  const timeStr = mins > 0
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : String(secs);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={onFinish}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"
          >
            <X size={16} />
          </button>
          <div>
            <p className="text-xs text-slate-500">Workout</p>
            <p className="text-sm font-bold text-white truncate max-w-[160px]">{workoutName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 flex items-center justify-center transition-all"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Übung {state.exerciseIndex + 1} von {exercises.length}</span>
          <span>{Math.round(overallProgress * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#1a1a25] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500"
            style={{ width: `${overallProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Main timer area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Phase label */}
        <p className={`text-xs font-bold tracking-widest uppercase mb-4 ${phaseColor}`}>
          {phaseLabel}
        </p>

        {/* Circular timer */}
        <CircularTimer value={state.timeLeft} max={maxTime} phase={state.phase}>
          {state.phase === 'countdown' ? (
            <div className="text-7xl font-black text-amber-400 animate-countdown">
              {state.timeLeft}
            </div>
          ) : (
            <>
              <div className={`text-5xl font-black ${state.phase === 'rest' ? 'text-slate-300' : 'text-white'}`}>
                {timeStr}
              </div>
              <div className="text-xs text-slate-500 mt-1">{state.phase === 'rest' ? 'Pause' : 'verbleibend'}</div>
            </>
          )}
        </CircularTimer>

        {/* Exercise info */}
        <div className="mt-6 text-center px-4">
          {state.phase === 'rest' ? (
            <>
              <p className="text-sm text-slate-500 mb-1">Nächste Übung</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{nextExercise?.exercise.emoji}</span>
                <p className="text-xl font-bold text-white">{nextExercise?.exercise.name}</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-3xl">{currentExercise.exercise.emoji}</span>
              </div>
              <p className="text-2xl font-black text-white">{currentExercise.exercise.name}</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                {currentExercise.exercise.description}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6 pb-2">
        <button
          onClick={skip}
          className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
        >
          <SkipForward size={20} />
        </button>

        <button
          onClick={() => setRunning((r) => !r)}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-purple-500/40 animate-glow"
        >
          {running ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
        </button>

        <button
          onClick={() => setState({ exerciseIndex: 0, phase: 'countdown', timeLeft: 3 })}
          className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Exercise queue preview */}
      {exercises.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 px-1">
          {exercises.map((e, i) => (
            <div
              key={e.id}
              className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                i === state.exerciseIndex
                  ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold'
                  : i < state.exerciseIndex
                  ? 'bg-white/5 border border-white/5 text-slate-600 line-through'
                  : 'bg-white/5 border border-white/5 text-slate-500'
              }`}
            >
              <span>{e.exercise.emoji}</span>
              <span className="max-w-[80px] truncate">{e.exercise.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
