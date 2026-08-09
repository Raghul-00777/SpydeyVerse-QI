interface StatusBadgeProps {
  status: 'active' | 'warning' | 'error' | 'info' | 'success';
  label: string;
  pulse?: boolean;
}

const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  info: 'bg-red-600/10 text-red-400 border-red-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const dotStyles = {
  active: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-rose-400',
  info: 'bg-red-500',
  success: 'bg-emerald-400',
};

export default function StatusBadge({ status, label, pulse = false }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]} ${pulse ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}
