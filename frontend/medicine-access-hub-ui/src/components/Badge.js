const VARIANTS = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  primary: 'bg-primary-tint text-primary',
  neutral: 'bg-app text-ink-soft border border-border'
};

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function stockBadgeVariant(status) {
  if (status === 'IN_STOCK') return 'success';
  if (status === 'LOW_STOCK') return 'warning';
  return 'danger';
}

export function stockBadgeLabel(status) {
  if (status === 'IN_STOCK') return 'In Stock';
  if (status === 'LOW_STOCK') return 'Low Stock';
  return 'Out of Stock';
}
