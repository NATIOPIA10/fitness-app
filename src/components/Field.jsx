export default function Field({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
          {label}
        </span>
      )}
      <input
        className="w-full min-h-[52px] bg-surface-raised border border-border rounded-2xl px-4 text-text placeholder:text-muted-2 focus:border-lime outline-none transition-colors"
        {...props}
      />
      {error && <span className="block text-coral text-xs mt-1.5">{error}</span>}
    </label>
  )
}

export function SelectField({ label, error, children, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
          {label}
        </span>
      )}
      <select
        className="w-full min-h-[52px] bg-surface-raised border border-border rounded-2xl px-4 text-text focus:border-lime outline-none transition-colors appearance-none"
        {...props}
      >
        {children}
      </select>
      {error && <span className="block text-coral text-xs mt-1.5">{error}</span>}
    </label>
  )
}

export function TextAreaField({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
          {label}
        </span>
      )}
      <textarea
        className="w-full min-h-[100px] bg-surface-raised border border-border rounded-2xl px-4 py-3 text-text placeholder:text-muted-2 focus:border-lime outline-none transition-colors resize-none"
        {...props}
      />
      {error && <span className="block text-coral text-xs mt-1.5">{error}</span>}
    </label>
  )
}
