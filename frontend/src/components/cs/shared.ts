export { registrarAcao, enviarPostMortem, analyzeDb } from "@/services/api";
export type { ClienteAtivo, PontoTrajetoria, PostMortem } from "@/types/inova";
import type { ClienteAtivo } from "@/types/inova";

export interface EspecificacaoRisco {
  nivel: "ALTA" | "MÉDIA" | "BAIXA";
  titulo: string;
  resumoCurto: string;
  explicacaoCompleta: string;
  fatoresCriticos: string[];
  regraGeral: string;
}

/**
 * Gera a especificação detalhada do porquê o cliente está classificado
 * como ALTO, MÉDIO ou BAIXO risco, considerando métricas reais e regras da IA.
 */
export function obterEspecificacaoRisco(cliente: ClienteAtivo): EspecificacaoRisco {
  const score = cliente.score_risco;
  const evidencias = cliente.evidencias ?? [];
  const evidenciasTexto = evidencias.join(" ");

  const diasAtraso = cliente.dias_atraso_pagamento ?? 0;
  const sla = cliente.pct_sla_cumprido ?? 80;
  const reabertos = cliente.chamados_reabertos ?? 0;
  const criticos = cliente.chamados_criticos ?? 0;
  const reclamacoes = cliente.reclamacoes_formais ?? 0;
  const npsStatus = cliente.nps_status ?? "";
  const semRespostaNps =
    npsStatus.includes("Não respondeu") || /parou de responder|silêncio/i.test(evidenciasTexto);

  // 1. ALTA (Score > 60)
  if (score > 60) {
    const fatores: string[] = [];
    if (reclamacoes > 0) fatores.push(`${reclamacoes} reclamações formais`);
    if (semRespostaNps) fatores.push("Silêncio Qualificado no NPS (3m sem responder)");
    if (diasAtraso >= 7) fatores.push(`${diasAtraso} dias de atraso de pagamento`);
    if (sla < 75) fatores.push(`SLA crítico em queda (${sla}%)`);
    if (reabertos >= 3) fatores.push(`${reabertos} chamados reabertos sucessivamente`);
    if (criticos >= 2) fatores.push(`${criticos} chamados de severidade crítica`);

    if (fatores.length === 0) {
      fatores.push("Forte queda de engajamento na plataforma");
      fatores.push("Fricção operacional acumulada no trimestre");
    }

    return {
      nivel: "ALTA",
      titulo: "Por que está ALTO?",
      resumoCurto: fatores.slice(0, 3).join(" · "),
      explicacaoCompleta: `Classificado como ALTO RISCO porque o Score (${score}/100) ultrapassa a régua de 60 pontos. O cliente acumula múltiplos sinais de atrito e distanciamento que precedem a perda do contrato: ${fatores.join(", ")}.`,
      fatoresCriticos: fatores,
      regraGeral:
        "Régua de Alto Risco (> 60 pts): Probabilidade crítica de cancelamento (> 65%). Exige intervenção executiva do CS em até 24 horas (QBR ou escalonamento N3).",
    };
  }

  // 2. MÉDIA (Score 40 a 60)
  if (score >= 40) {
    const fatores: string[] = [];
    if (criticos > 0) fatores.push(`${criticos} chamados críticos em aberto`);
    if (reabertos > 0) fatores.push(`${reabertos} chamados reabertos`);
    if (diasAtraso > 0) fatores.push(`${diasAtraso} dias de atraso pontual na fatura`);
    if (sla < 90) fatores.push(`SLA oscilando em ${sla}%`);
    if (semRespostaNps) fatores.push("Pendente de resposta no NPS");

    if (fatores.length === 0) {
      fatores.push("Oscilações no uso mensal da ferramenta");
      fatores.push("Chamados de suporte com tempo de resolução acima da média");
    }

    return {
      nivel: "MÉDIA",
      titulo: "Por que está MÉDIO?",
      resumoCurto: fatores.slice(0, 3).join(" · "),
      explicacaoCompleta: `Classificado como MÉDIO RISCO (faixa 40-60 pts). O cliente não solicitou cancelamento formal, mas apresenta instabilidade operacional e sinais de alerta preventivo: ${fatores.join(", ")}.`,
      fatoresCriticos: fatores,
      regraGeral:
        "Régua de Médio Risco (40 a 60 pts): Atenção preventiva. O CSM deve atuar em até 72 horas com alinhamento operacional para evitar evolução para crise.",
    };
  }

  // 3. BAIXA (Score < 40)
  return {
    nivel: "BAIXA",
    titulo: "Por que está BAIXO?",
    resumoCurto: "SLA cumprido acima de 90% · Pagamentos em dia · NPS promotor",
    explicacaoCompleta: `Classificado como BAIXO RISCO (abaixo de 40 pts). A conta possui saúde operacional exemplar, SLAs cumpridos com folga contratual, histórico pontual de pagamentos e alta taxa de adoção dos recursos.`,
    fatoresCriticos: [
      "Cumprimento integral de SLA contratado (> 90%)",
      "Adimplência e pontualidade financeira",
      "Ausência de reclamações formais",
      "NPS promotor com alto engajamento",
    ],
    regraGeral:
      "Régua de Baixo Risco (< 40 pts): Retenção consolidada. Conta propícia para ações de expansão contratual (Upsell / Cross-sell).",
  };
}
