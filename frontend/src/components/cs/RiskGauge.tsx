import React from "react";
import { AlertOctagon, AlertTriangle, ShieldCheck } from "lucide-react";

interface RiskGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function RiskGauge({ score, size = 180, strokeWidth = 14 }: RiskGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const isNeonRed = normalizedScore > 80;
  const isHighRisk = normalizedScore >= 60;
  const isMediumRisk = normalizedScore >= 40 && normalizedScore < 60;

  // Dimensões do SVG
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arco de 270 graus para um medidor de gauge esportivo/executivo
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * normalizedScore) / 100;

  // Cores dinâmicas
  let color = "oklch(0.75 0.16 155)"; // Verde seguro
  let glowStyle = "drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))";
  let statusText = "Risco Baixo";
  let textColor = "text-risk-low";

  if (isNeonRed) {
    color = "oklch(0.63 0.24 25)"; // Vermelho Neon Crítico
    glowStyle =
      "drop-shadow(0 0 12px rgba(255, 45, 85, 0.9)) drop-shadow(0 0 24px rgba(255, 45, 85, 0.5))";
    statusText = "RISCO CRÍTICO NEON";
    textColor = "text-risk-high text-glow-risk";
  } else if (isHighRisk) {
    color = "oklch(0.68 0.22 35)";
    glowStyle = "drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))";
    statusText = "Risco Alto";
    textColor = "text-risk-high";
  } else if (isMediumRisk) {
    color = "oklch(0.8 0.16 70)";
    glowStyle = "drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))";
    statusText = "Risco Médio";
    textColor = "text-risk-mid";
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-3">
      {/* Aura de fundo no caso de Neon Red > 80 */}
      {isNeonRed && (
        <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-risk-high/15 blur-2xl pointer-events-none" />
      )}

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="rotate-[135deg] transform overflow-visible"
        >
          {/* Pista de fundo do arco */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="oklch(1 0 0 / 8%)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Arco medidor de progresso */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s ease-in-out, stroke 0.5s ease",
              filter: glowStyle,
            }}
          />
        </svg>

        {/* Conteúdo Central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center gap-1">
            {isNeonRed ? (
              <AlertOctagon className="h-5 w-5 text-risk-high animate-pulse" />
            ) : isHighRisk ? (
              <AlertTriangle className="h-4 w-4 text-risk-high" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-risk-low" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Score IA
            </span>
          </div>

          <div className="mt-0.5 flex items-baseline justify-center">
            <span
              className={`font-display text-4xl font-extrabold tracking-tight tabular-nums ${textColor}`}
              style={{
                textShadow: isNeonRed
                  ? "0 0 16px rgba(255, 45, 85, 0.8), 0 0 30px rgba(255, 45, 85, 0.4)"
                  : undefined,
              }}
            >
              {normalizedScore}
            </span>
            <span className="ml-1 text-xs font-semibold text-muted-foreground">/100</span>
          </div>

          <div className="mt-1">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                isNeonRed
                  ? "bg-risk-high/20 text-risk-high ring-risk-high/50 shadow-[0_0_12px_oklch(0.63_0.24_25/0.7)]"
                  : isHighRisk
                    ? "bg-risk-high/15 text-risk-high ring-risk-high/30"
                    : isMediumRisk
                      ? "bg-risk-mid/15 text-risk-mid ring-risk-mid/30"
                      : "bg-risk-low/15 text-risk-low ring-risk-low/30"
              }`}
            >
              {statusText}
            </span>
          </div>
        </div>
      </div>

      {isNeonRed && (
        <p className="mt-2 text-center text-[11px] font-bold text-risk-high uppercase tracking-wider animate-bounce">
          ⚡ Alerta Imediato: Risco Superior a 80%
        </p>
      )}
    </div>
  );
}
