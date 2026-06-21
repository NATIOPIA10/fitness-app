export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-border border-t-lime rounded-full animate-spin" />
        <span className="text-muted text-sm font-medium">Loading</span>
      </div>
    </div>
  )
}
