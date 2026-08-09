import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'web' | 'fade'>('web');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(progressTimer); return 100; }
        return prev + Math.random() * 8 + 2;
      });
    }, 80);

    // Total screen duration: 2.8s
    const fadeTimer = setTimeout(() => setPhase('fade'), 2400);
    const doneTimer = setTimeout(onComplete, 2900);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const cx = 200;
  const cy = 200;
  const rings = [40, 80, 120, 160];
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const toRad = (d: number) => (d * Math.PI) / 180;

  function webPoint(radius: number, angleDeg: number) {
    const r = toRad(angleDeg);
    return { x: cx + radius * Math.cos(r), y: cy + radius * Math.sin(r) };
  }

  function octPoints(radius: number) {
    return angles.map(a => { const p = webPoint(radius, a); return `${p.x},${p.y}`; }).join(' ');
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-void"
      style={{
        transition: 'opacity 0.5s ease',
        opacity: phase === 'fade' ? 0 : 1,
      }}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-red-600/5 blur-3xl" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-rose-600/8 blur-2xl" />
      </div>

      {/* Spider web SVG */}
      <div className="relative">
        <svg
          width={400}
          height={400}
          viewBox="0 0 400 400"
          className="absolute -top-[200px] -left-[200px]"
          style={{ opacity: 0.18 }}
        >
          {rings.map((r, ri) => (
            <polygon
              key={r}
              points={octPoints(r * 2.4)}
              fill="none"
              stroke="#e01515"
              strokeWidth={0.8}
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000,
                animation: `webDraw ${0.6 + ri * 0.25}s ease-out forwards`,
                animationDelay: `${ri * 0.15}s`,
              }}
            />
          ))}
          {angles.map((angle, ai) => {
            const far = webPoint(rings[rings.length - 1] * 2.4, angle);
            return (
              <line
                key={angle}
                x1={cx} y1={cy} x2={far.x} y2={far.y}
                stroke="#e01515"
                strokeWidth={0.7}
                style={{
                  strokeDasharray: 500,
                  strokeDashoffset: 500,
                  animation: `webDraw 0.5s ease-out forwards`,
                  animationDelay: `${0.1 + ai * 0.05}s`,
                }}
              />
            );
          })}
        </svg>

        {/* Main web animation — full size */}
        <svg
          width={400}
          height={400}
          viewBox="0 0 400 400"
          style={{ display: 'block' }}
        >
          {/* Background rings */}
          {rings.map((r, ri) => (
            <polygon
              key={`ring-${r}`}
              points={octPoints(r)}
              fill="none"
              stroke="#e01515"
              strokeWidth={1.2}
              opacity={0.3 + ri * 0.1}
              style={{
                strokeDasharray: 800,
                strokeDashoffset: 800,
                animation: `webDraw ${0.7 + ri * 0.3}s ease-out forwards`,
                animationDelay: `${0.2 + ri * 0.15}s`,
              }}
            />
          ))}

          {/* Radial threads */}
          {angles.map((angle, ai) => {
            const far = webPoint(rings[rings.length - 1], angle);
            return (
              <line
                key={`thread-${angle}`}
                x1={cx} y1={cy}
                x2={far.x} y2={far.y}
                stroke="#ff3b3b"
                strokeWidth={1}
                opacity={0.5}
                style={{
                  strokeDasharray: 200,
                  strokeDashoffset: 200,
                  animation: `webDraw 0.6s ease-out forwards`,
                  animationDelay: `${ai * 0.07}s`,
                }}
              />
            );
          })}

          {/* Glowing center spider logo */}
          <g style={{ animation: 'fadeIn 0.5s ease-out forwards', animationDelay: '0.8s', opacity: 0 }}>
            {/* Center glow */}
            <circle cx={cx} cy={cy} r={36} fill="rgba(224,21,21,0.08)" />
            <circle cx={cx} cy={cy} r={28} fill="rgba(224,21,21,0.12)" />

            {/* Spider web logo in center */}
            {[8, 16, 24].map((r, i) => (
              <polygon
                key={`center-${r}`}
                points={angles.map(a => { const p = webPoint(r, a); return `${p.x},${p.y}`; }).join(' ')}
                fill="none"
                stroke="#e01515"
                strokeWidth={0.8}
                opacity={0.8 - i * 0.15}
              />
            ))}
            {angles.map(angle => {
              const far = webPoint(24, angle);
              return <line key={`cl-${angle}`} x1={cx} y1={cy} x2={far.x} y2={far.y} stroke="#e01515" strokeWidth={0.8} opacity={0.7} />;
            })}
            <circle cx={cx} cy={cy} r={3.5} fill="#e01515" />

            {/* Outer pulsing ring */}
            <circle
              cx={cx} cy={cy} r={30}
              fill="none"
              stroke="#e01515"
              strokeWidth={1}
              opacity={0.4}
              style={{ animation: 'glowPulse 2s ease-in-out infinite' }}
            />
          </g>

          {/* Animated traveling dot along the web */}
          <circle r={3} fill="#ff3b3b" opacity={0.9}>
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.8s"
              path={`M ${webPoint(rings[0], 0).x} ${webPoint(rings[0], 0).y}
                     L ${webPoint(rings[1], 0).x} ${webPoint(rings[1], 0).y}
                     L ${webPoint(rings[1], 45).x} ${webPoint(rings[1], 45).y}
                     L ${webPoint(rings[2], 45).x} ${webPoint(rings[2], 45).y}
                     L ${webPoint(rings[2], 90).x} ${webPoint(rings[2], 90).y}
                     L ${webPoint(rings[3], 90).x} ${webPoint(rings[3], 90).y}
                     L ${webPoint(rings[3], 135).x} ${webPoint(rings[3], 135).y}
                     L ${webPoint(rings[2], 135).x} ${webPoint(rings[2], 135).y}
                     L ${webPoint(rings[1], 135).x} ${webPoint(rings[1], 135).y}
                     L ${webPoint(rings[0], 135).x} ${webPoint(rings[0], 135).y}`}
            />
          </circle>
        </svg>
      </div>

      {/* Branding */}
      <div className="flex flex-col items-center gap-3 mt-4" style={{ animation: 'slideInUp 0.6s ease-out forwards', animationDelay: '0.4s', opacity: 0 }}>
        <div className="text-2xl font-bold tracking-tight text-white">
          Spydey<span className="gradient-text">Verse</span>
        </div>
        <div className="text-xs font-medium text-slate-500 tracking-[0.3em] uppercase">
          Quantum Intelligence Platform
        </div>

        {/* Progress bar */}
        <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden mt-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-600 transition-all duration-100"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-700 font-mono">
          {progress >= 100 ? 'Ready' : 'Initializing...'}
        </div>
      </div>

      {/* Tagline */}
      <div
        className="absolute bottom-10 text-[11px] text-slate-700 tracking-widest uppercase"
        style={{ animation: 'fadeIn 1s ease-out forwards', animationDelay: '1s', opacity: 0 }}
      >
        "Tomorrow's Problems. Solved Today."
      </div>
    </div>
  );
}
