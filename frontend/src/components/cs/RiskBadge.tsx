import { nivelRisco } from "@/types/inova";
import { cn } from "@/lib/utils";

const map = {
  alto: { dot: "bg-risk-high", text: "text-risk-high", ring: "ring-risk-high/30", bg: "bg-risk-high/10", label: "Alto Risco" },
  medio: { dot: "bg-risk-mid", text: "text-risk-mid", ring: "ring-risk-mid/30", bg: "bg-risk-mid/10", label: "Médio Risco" },
  baixo: { dot: "bg-risk-low", text: "text-risk-low", ring: "ring-risk-low/30", bg: "bg-risk-low/10", label: "Baixo Risco" },
} as const;

export function RiskBadge({ score, className }: { score: number; className?: string }) {
  const s = map[nivelRisco(score)];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        s.bg,
        s.ring,
        s.text,
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", s.dot)} />
      {s.label} · {score}/100
    </span>
  );
}

export function RiskMeter({ score }: { score: number }) {
  const s = map[nivelRisco(score)];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all", s.dot)} style={{ width: `${score}%` }} />
    </div>
  );
}
