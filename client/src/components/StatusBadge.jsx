const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-[var(--color-active)]/10 text-[var(--color-active)] border-[var(--color-active)]/20';
      case 'pending':
        return 'bg-[var(--color-pending)]/10 text-[var(--color-pending)] border-[var(--color-pending)]/20';
      case 'expired':
        return 'bg-[var(--color-expired)]/10 text-[var(--color-expired)] border-[var(--color-expired)]/20';
      default:
        return 'bg-white/5 text-[var(--color-text-secondary)] border-white/10';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles()} capitalize`}>
      {status}
    </span>
  );
};

export default StatusBadge;
