export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const base =
    'w-full min-h-[52px] rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100'

  const variants = {
    primary: 'bg-lime text-ink hover:bg-lime-dim',
    secondary: 'bg-surface-raised text-text border border-border',
    ghost: 'bg-transparent text-muted',
    danger: 'bg-coral/10 text-coral border border-coral/30',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
