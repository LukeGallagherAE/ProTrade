import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface BadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export default function Badge({ status, label, size = 'md' }: BadgeProps) {
  const colorClass = getStatusColor(status);
  const text = label ?? getStatusLabel(status);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${colorClass}`}>
      {text}
    </span>
  );
}
