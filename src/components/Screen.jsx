export default function Screen({ title, subtitle, action, children, noPadding }) {
  return (
    <div
      className="min-h-screen bg-ink"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 7rem)' }}
    >
      {(title || action) && (
        <header
          className="sticky top-0 z-30 bg-ink/95 backdrop-blur px-5 pb-4 flex items-start justify-between"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}
        >
          <div>
            {subtitle && (
              <p className="text-muted text-xs font-semibold uppercase tracking-widest mb-1">
                {subtitle}
              </p>
            )}
            {title && <h1 className="font-display text-4xl leading-none">{title}</h1>}
          </div>
          {action}
        </header>
      )}
      <main className={noPadding ? '' : 'px-5'}>{children}</main>
    </div>
  )
}
