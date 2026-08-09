interface SpiderLogoProps {
  size?: number;
  className?: string;
}

// Custom spider web / spider icon — original design, not based on any copyrighted asset
export default function SpiderLogo({ size = 20, className = '' }: SpiderLogoProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r1 = s * 0.12;
  const r2 = s * 0.24;
  const r3 = s * 0.38;
  const outer = s * 0.46;

  // 8 radial lines at 45° intervals
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const lines = angles.map(deg => {
    const rad = toRad(deg);
    return {
      x1: cx + r1 * Math.cos(rad),
      y1: cy + r1 * Math.sin(rad),
      x2: cx + outer * Math.cos(rad),
      y2: cy + outer * Math.sin(rad),
    };
  });

  // Pentagon web rings — octagonal
  function octagonPoints(radius: number) {
    return angles
      .map(deg => {
        const rad = toRad(deg);
        return `${cx + radius * Math.cos(rad)},${cy + radius * Math.sin(rad)}`;
      })
      .join(' ');
  }

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer glow circle */}
      <circle cx={cx} cy={cy} r={outer + 1} fill="rgba(224,21,21,0.08)" />

      {/* Radial lines */}
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1}
          x2={l.x2} y2={l.y2}
          stroke="currentColor"
          strokeWidth={s * 0.04}
          strokeLinecap="round"
          opacity={0.9}
        />
      ))}

      {/* Web rings (octagonal) */}
      <polygon
        points={octagonPoints(r3)}
        stroke="currentColor"
        strokeWidth={s * 0.035}
        fill="none"
        opacity={0.75}
      />
      <polygon
        points={octagonPoints(r2)}
        stroke="currentColor"
        strokeWidth={s * 0.035}
        fill="none"
        opacity={0.6}
      />
      <polygon
        points={octagonPoints(r1)}
        stroke="currentColor"
        strokeWidth={s * 0.035}
        fill="none"
        opacity={0.5}
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={s * 0.07} fill="currentColor" opacity={0.95} />
    </svg>
  );
}
