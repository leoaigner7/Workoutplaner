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

function CircularTimer({ value, max, phase, children }: {
  value: number; max: number; phase: Phase; children: React.ReactNode;
}) {
  const R = 108;
  const circ = 2 * Math.PI * R;
  const progress  = max > 0 ? value / max : 0;
  const dashOffset = circ * (1 - progress);

  const strokeColor =
    phase === 'rest'      ? '#22c55e'  :
    phase === 'countdown' ? '#f59e0b'  :
                            'url(#ringGrad)';

  const glowColor =
    phase === 'rest'      ? 'rgba(34,197,94,0.35)'   :
    phase === 'countdown' ? 'rgba(245,158,11,0.45)'  :
                            'rgba(139,92,246,0.45)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 256, height: 256 }}>
      <svg width="256" height="256" className="absolute inset-0 -rotate-90" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#6366f1" />
            <stop offset="50%"  stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx="128" cy="128" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        {/* progress */}
        <circle
          cx="128" cy="128" r={R}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s ease',
            filter: `drop-shadow(0 0 10px ${glowColor})`,
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
  const ctx  = useRef<AudioContext | null>(null);
  const muted = useRef(false);
  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx.current;
  };
  const beep = useCallback((freq = 880, duration = 0.12, vol = 0.3) => {
    if (muted.current) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.start(ac.currentTime); osc.stop(ac.currentTime + duration);
    } catch {}
  }, []);
  const setMuted = (v: boolean) => { muted.current = v; };
  return { beep, setMuted, getMuted: () => muted.current };
}

export function WorkoutRunner({ exercises, workoutName, onFinish }: Props) {
  const [state, setState] = useState<RunnerState>({ exerciseIndex: 0, phase: 'countdown', timeLeft: 3 });
  const [running, setRunning] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const { beep, setMuted } = useBeep();

  const current = exercises[state.exerciseIndex];
  const next    = exercises[state.exerciseIndex + 1];

  const getMax = (s: RunnerState) => {
    if (s.phase === 'countdown') return 3;
    if (s.phase === 'exercise') return exercises[s.exerciseIndex].durationSeconds;
    if (s.phase === 'rest')     return exercises[s.exerciseIndex].restSeconds;
    return 0;
  };

  const advance = useCallback((s: RunnerState): RunnerState => {
    if (s.phase === 'countdown') return { ...s, phase: 'exercise', timeLeft: exercises[s.exerciseIndex].durationSeconds };
    if (s.phase === 'exercise') {
      const rest = exercises[s.exerciseIndex].restSeconds;
      if (rest > 0) return { ...s, phase: 'rest', timeLeft: rest };
      const ni = s.exerciseIndex + 1;
      if (ni >= exercises.length) return { ...s, phase: 'done', timeLeft: 0 };
      return { exerciseIndex: ni, phase: 'countdown', timeLeft: 3 };
    }
    if (s.phase === 'rest') {
      const ni = s.exerciseIndex + 1;
      if (ni >= exercises.length) return { ...s, phase: 'done', timeLeft: 0 };
      return { exerciseIndex: ni, phase: 'countdown', timeLeft: 3 };
    }
    return s;
  }, [exercises]);

  useEffect(() => {
    if (!running || state.phase === 'done') return;
    const id = setInterval(() => {
      setState((prev) => {
        const next = prev.timeLeft - 1;
        if (next === 3 || next === 2 || next === 1) beep(660, 0.1);
        if (next <= 0) {
          beep(prev.phase === 'exercise' ? 440 : 880, 0.2, 0.5);
          return advance(prev);
        }
        return { ...prev, timeLeft: next };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, state.phase, advance, beep]);

  const toggleSound = () => { const n = !soundOn; setSoundOn(n); setMuted(!n); };
  const skip    = () => setState((p) => advance({ ...p, timeLeft: 0 }));
  const restart = () => { setState({ exerciseIndex: 0, phase: 'countdown', timeLeft: 3 }); setRunning(true); };

  const totalAll  = exercises.reduce((a, e) => a + e.durationSeconds + e.restSeconds, 0);
  const totalDone = exercises.slice(0, state.exerciseIndex).reduce((a, e) => a + e.durationSeconds + e.restSeconds, 0);
  const progress  = totalAll > 0 ? totalDone / totalAll : 0;
  const totalCals = exercises.reduce((a, e) => a + Math.round((e.exercise.calsBurnedPerMin * e.durationSeconds) / 60), 0);

  /* ─── DONE screen ─── */
  if (state.phase === 'done') {
    return (
      <div className="flex flex-col items-center text-center px-6 py-8 animate-slide-up">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-6xl mb-6 shadow-2xl shadow-violet-500/40">
          🏆
        </div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Workout done!</h1>
        <p className="text-slate-400 text-sm mb-8">Hammer Leistung – du hast durchgehalten! 💪</p>

        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-8">
          {[
            { val: exercises.length, label: 'Übungen', color: 'text-violet-400' },
            { val: `${totalCals}`, label: 'Kalorien', color: 'text-amber-400' },
            { val: `${Math.round(totalAll / 60)}'`, label: 'Minuten', color: 'text-emerald-400' },
          ].map(({ val, label, color }) => (
            <div key={label} className="rounded-2xl bg-[#0f1120] border border-white/[0.06] p-4 text-center">
              <p className={`text-2xl font-black ${color}`}>{val}</p>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={restart}
            className="flex-1 py-3.5 rounded-xl bg-[#0f1120] border border-white/[0.06] text-white font-bold text-sm flex items-center justify-center gap-2 hover:border-violet-500/30 transition-all">
            <RotateCcw size={14} />
            Nochmal
          </button>
          <button onClick={onFinish}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-purple-500">
            <CheckCircle size={14} />
            Fertig
          </button>
        </div>
      </div>
    );
  }

  const maxTime = getMax(state);
  const mins = Math.floor(state.timeLeft / 60);
  const secs = state.timeLeft % 60;
  const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : String(secs);

  const phaseLabel =
    state.phase === 'countdown' ? '⏱ BEREIT MACHEN' :
    state.phase === 'exercise'  ? '🔥 ÜBUNG' :
                                  '💤 PAUSE';

  const phaseColor =
    state.phase === 'countdown' ? 'text-amber-400' :
    state.phase === 'exercise'  ? 'text-violet-400' :
                                  'text-emerald-400';

  const timerColor =
    state.phase === 'rest'      ? 'text-emerald-400' :
    state.phase === 'countdown' ? 'text-amber-400'   :
                                  'text-white';

  return (
    <div className="flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <button onClick={onFinish}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/15 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all">
            <X size={15} />
          </button>
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Workout</p>
            <p className="text-sm font-black text-white truncate max-w-[180px]">{workoutName}</p>
          </div>
        </div>
        <button onClick={toggleSound}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-violet-500/15 text-slate-400 hover:text-violet-400 flex items-center justify-center transition-all">
          {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-[10px] text-slate-600 mb-1.5 font-semibold">
          <span>Übung {state.exerciseIndex + 1} von {exercises.length}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-700"
            style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Phase label */}
      <p className={`text-[11px] font-black tracking-widest uppercase text-center mb-4 ${phaseColor}`}>
        {phaseLabel}
      </p>

      {/* Timer */}
      <div className="flex justify-center mb-4">
        <CircularTimer value={state.timeLeft} max={maxTime} phase={state.phase}>
          {state.phase === 'countdown' ? (
            <div className="text-7xl font-black text-amber-400 leading-none">
              {state.timeLeft}
            </div>
          ) : (
            <>
              <div className={`text-5xl font-black leading-none tracking-tight ${timerColor}`}>
                {timeStr}
              </div>
              <div className="text-[10px] text-slate-600 mt-1.5 uppercase tracking-widest font-semibold">
                {state.phase === 'rest' ? 'Pause' : 'verbleibend'}
              </div>
            </>
          )}
        </CircularTimer>
      </div>

      {/* Exercise info */}
      <div className="text-center px-4 mb-6 min-h-[80px]">
        {state.phase === 'rest' ? (
          <>
            <p className="text-xs text-slate-500 mb-2 font-semibold">Nächste Übung</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{next?.exercise.emoji}</span>
              <p className="text-xl font-black text-white">{next?.exercise.name}</p>
            </div>
          </>
        ) : (
          <>
            <span className="text-4xl mb-2 block">{current.exercise.emoji}</span>
            <p className="text-xl font-black text-white mb-1">{current.exercise.name}</p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {current.exercise.description}
            </p>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <button onClick={skip}
          className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/8 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-90">
          <SkipForward size={18} />
        </button>

        <button onClick={() => setRunning(r => !r)}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-violet-500/40">
          {running ? <Pause size={26} fill="white" /> : <Play size={26} fill="white" />}
        </button>

        <button onClick={restart}
          className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/8 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-90">
          <RotateCcw size={17} />
        </button>
      </div>

      {/* Queue strip */}
      {exercises.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 px-1">
          {exercises.map((e, i) => (
            <div key={e.id} className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] transition-all ${
              i === state.exerciseIndex
                ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300 font-bold'
                : i < state.exerciseIndex
                ? 'bg-white/[0.03] border border-white/[0.03] text-slate-700 line-through'
                : 'bg-white/[0.04] border border-white/[0.04] text-slate-500'
            }`}>
              <span>{e.exercise.emoji}</span>
              <span className="max-w-[70px] truncate">{e.exercise.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
