interface Props {
  label?: string;
}

// Standard loading indicator used across the admin tabs and anywhere else
// that needs a small, in-flow "data is on its way" cue.
function LoadingPulse({ label = "Loading…" }: Props) {
  return (
    <div className="flex items-center gap-2 py-10">
      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
}

export default LoadingPulse;
