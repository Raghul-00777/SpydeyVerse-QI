import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  glow?: 'blue' | 'cyan' | 'crimson' | 'green' | 'none';
  hover?: boolean;
  onClick?: () => void;
}

const glowColors = {
  blue: 'hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(224,21,21,0.2)]',
  cyan: 'hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(255,59,59,0.2)]',
  crimson: 'hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(224,21,21,0.2)]',
  green: 'hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
  none: '',
};

export default function GlowCard({ children, className = '', style, id, glow = 'blue', hover = true, onClick }: GlowCardProps) {
  return (
    <div
      id={id}
      style={style}
      onClick={onClick}
      className={`
        glass rounded-xl border border-white/5 transition-all duration-300
        ${hover ? `${glowColors[glow]} hover:-translate-y-0.5` : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
