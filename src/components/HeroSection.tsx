import { useState, useEffect } from 'react';
import { Play, ChevronDown, Zap, Shield, Dumbbell } from 'lucide-react';

interface Props {
  onStartWorkout: () => void;
  onExplore: () => void;
  totalExercises: number;
}

const FLOATERS = [
  { emoji: '💪', top: '18%', left: '6%',   delay: '0s',    dur: '3.8s',  size: '3rem'  },
  { emoji: '⚽', top: '12%', right: '8%',  delay: '1.2s',  dur: '4.5s',  size: '2.8rem'},
  { emoji: '🔥', top: '65%', left: '4%',   delay: '0.6s',  dur: '3.2s',  size: '2.4rem'},
  { emoji: '🏆', top: '8%',  left: '42%',  delay: '2s',    dur: '5s',    size: '2rem'  },
  { emoji: '🦵', top: '70%', right: '5%',  delay: '0.3s',  dur: '4s',    size: '2.6rem'},
  { emoji: '⚡', top: '45%', right: '12%', delay: '1.8s',  dur: '3.5s',  size: '2.2rem'},
  { emoji: '🏃', top: '55%', left: '10%',  delay: '0.9s',  dur: '4.2s',  size: '2rem'  },
];

function useCountUp(target: number, duration = 1400, startDelay = 400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const steps = 60;
      const inc = target / steps;
      let cur = 0;
      const interval = setInterval(() => {
        cur += inc;
        if (cur >= target) { setCount(target); clearInterval(interval); }
        else setCount(Math.floor(cur));
      }, duration / steps);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [target, duration, startDelay]);
  return count;
}

export function HeroSection({ onStartWorkout, onExplore, totalExercises }: Props) {
  const [phase, setPhase] = useState(0);
  const exCount = useCountUp(totalExercises, 1200, 600);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 280);
    const t3 = setTimeout(() => setPhase(3), 480);
    const t4 = setTimeout(() => setPhase(4), 680);
    const t5 = setTimeout(() => setPhase(5), 880);
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout);
  }, []);

  const cls = (p: number) =>
    `transition-all duration-700 ${phase >= p ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`;

  return (
    <section className="relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #059669 100%)',
      paddingBottom: '80px',
    }}>

      {/* ── Animated background rings ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="animate-spin-slow" style={{
          width: '700px', height: '700px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'absolute',
        }} />
        <div className="animate-spin-slow-r" style={{
          width: '500px', height: '500px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.08)',
          position: 'absolute',
        }} />
        <div style={{
          width: '300px', height: '300px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'absolute',
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      {/* ── Floating emojis ── */}
      {FLOATERS.map(f => (
        <span key={f.emoji} className="absolute select-none pointer-events-none"
          style={{
            top: f.top, left: f.left, right: f.right,
            fontSize: f.size,
            opacity: 0.2,
            animation: `float ${f.dur} ease-in-out ${f.delay} infinite`,
          }}>
          {f.emoji}
        </span>
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-6 text-center">

        {/* Pill badge */}
        <div className={`${cls(1)} inline-flex items-center gap-2 mb-7`}>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <Zap size={14} className="text-yellow-300" fill="currentColor" />
            <span className="text-white/90 text-sm font-semibold tracking-wide">Dein Fitness-Trainer</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className={`${cls(2)} text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] tracking-tight mb-5`}>
          Trainiere smarter.
          <br />
          <span style={{ color: '#a7f3d0' }}>Nicht härter.</span>
        </h1>

        {/* Subline */}
        <p className={`${cls(3)} text-lg text-teal-100/80 mb-10 max-w-xl mx-auto leading-relaxed`}>
          Professionelle Übungsanleitungen für Fußball, Kraft und Verletzungsprävention – komplett kostenlos.
        </p>

        {/* Stats */}
        <div className={`${cls(4)} flex items-center justify-center gap-8 mb-12`}>
          {[
            { value: exCount, label: 'Übungen', icon: Dumbbell },
            { value: 5, label: 'Kategorien', icon: Zap },
            { value: '0€', label: 'Kosten', icon: Shield },
          ].map(({ value, label, icon: Icon }, i) => (
            <div key={label} className="text-center">
              {i > 0 && <div style={{ display: 'none' }} />}
              <div className="text-4xl md:text-5xl font-black text-white mb-1 tabular-nums">
                {value}
              </div>
              <div className="flex items-center gap-1 justify-center text-teal-200 text-sm font-semibold">
                <Icon size={12} />
                {label}
              </div>
            </div>
          )).reduce<React.ReactNode[]>((acc, el, i) => [
            ...acc,
            el,
            i < 2 ? <div key={`sep-${i}`} style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }} /> : null,
          ], [])}
        </div>

        {/* CTA Buttons */}
        <div className={`${cls(5)} flex flex-col sm:flex-row items-center justify-center gap-3`}>
          <button onClick={onStartWorkout}
            className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'white',
              color: '#0d9488',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.12)',
            }}>
            <span className="w-7 h-7 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <Play size={14} fill="#0d9488" className="text-teal-600 translate-x-0.5" />
            </span>
            Workout starten
          </button>

          <button onClick={onExplore}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(12px)',
            }}>
            Übungen entdecken
            <ChevronDown size={18} className="animate-bounce" />
          </button>
        </div>
      </div>

      {/* ── Feature pills ── */}
      <div className={`${cls(5)} relative z-10 flex flex-wrap items-center justify-center gap-2 px-6 mt-8`}>
        {[
          '⚽ Fußball & Athletik',
          '🦵 Verletzungsprävention',
          '💪 Kraft & Muskeln',
          '🦶 Sprunggelenk',
          '🏃 Propriozeption',
        ].map(tag => (
          <span key={tag} className="text-[12px] font-semibold px-3 py-1.5 rounded-full text-teal-100"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            {tag}
          </span>
        ))}
      </div>

      {/* ── Wave divider ── */}
      <div className="absolute bottom-0 left-0 right-0 leading-none">
        <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '72px' }}>
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,10 1440,40 L1440,72 L0,72 Z"
            fill="#f4f6fb" />
        </svg>
      </div>
    </section>
  );
}
