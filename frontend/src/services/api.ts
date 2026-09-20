/**
 * Serviço de integração com o motor Python (FastAPI + SQL Server + IA).
 * Rota principal: POST http://127.0.0.1:8000/analyze_excel
 * Fallbacks:     POST http://127.0.0.1:8000/analyze_db -> base mockada
 */
import type {
  AnalyzeDbResponse,
  ClienteAtivo,
  FilaItemAPI,
  PostMortem,
} from "@/types/inova";
import { acoesVipPorCliente, clientesMock, matrizSla } from "@/data/mock";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_API_URL"]) ||
  "http://127.0.0.1:8000";

/** Porte = poderio financeiro (Grande/Médio/Pequeno) informado pelo back-end. */
function derivarPorte(texto: string): string {
  if (/pequeno/i.test(texto)) return "Pequeno";
  if (/m[eé]dio/i.test(texto)) return "Médio";
  if (/grande/i.test(texto)) return "Grande";
  return "Grande";
}

/** Plano = pacote contratado que define o SLA (Essencial 24h / Avançado 12h / Enterprise 6h). */
function derivarPlano(texto: string): string {
  if (/essencial/i.test(texto)) return "Essencial";
  if (/avan[çc]ado/i.test(texto)) return "Avançado";
  if (/enterprise|corporate/i.test(texto)) return "Enterprise";
  return "Enterprise";
}

/** Converte um item cru da fila do Python no modelo usado pela interface. */
export function mapFilaItem(item: FilaItemAPI): ClienteAtivo {
  const ev = item.evidencias ?? "";
  const num = (re: RegExp) => {
    const m = ev.match(re);
    return m ? Number(m[1]) : 0;
  };
  const flt = (re: RegExp) => {
    const m = ev.match(re);
    return m?.[1] ? Number(m[1].replace(",", ".")) : undefined;
  };

  const bruto = item.plano ?? "";
  const porte = derivarPorte(bruto);
  const planoExibicao = derivarPlano(bruto);

  // Atendimentos NÃO podem ultrapassar o tempo máximo (contrato do plano − margem de erro 2h).
  const tempoBruto = flt(/(?:tempo de resposta|resposta)[^\d]*([\d.,]+)\s*h/i);
  const maximo = matrizSla[planoExibicao]?.tempo_maximo_h;
  const tempoResposta =
    tempoBruto !== undefined && maximo !== undefined ? Math.min(tempoBruto, maximo) : tempoBruto;


  return {
    cliente_id: item.cliente_id,
    segmento: item.segmento,
    porte,
    plano: planoExibicao,
    urgencia_fila: item.urgencia_fila >= 70 ? "Alta" : item.urgencia_fila >= 40 ? "Média" : "Baixa",
    ...(tempoResposta !== undefined ? { tempo_resposta_h: tempoResposta } : {}),
    valor_mensal: item.valor_mensal,
    score_risco: item.score_risco,
    prioridade_financeira: Math.round(item.score_risco * item.valor_mensal),
    pct_sla_cumprido: num(/SLA em deterioração \(([\d.]+)%/),
    chamados_reabertos: num(/chamados reabertos \((\d+)/),
    chamados_criticos: num(/chamados críticos \((\d+)/),
    reclamacoes_formais: num(/(\d+) reclamaç/i),
    dias_atraso_pagamento: num(/Atraso financeiro crítico \((\d+)/),
    nps_status: /parou de responder/i.test(ev)
      ? "Não respondeu à pesquisa"
      : /Detrator/i.test(ev)
        ? "Detrator"
        : "Respondente",
    acao_prescritiva:
      acoesVipPorCliente[item.cliente_id] ?? item.acao_recomendada,
    ...(item.palavras_chave ? { palavras_chave: item.palavras_chave } : {}),
    evidencias: ev ? ev.split(" | ") : [],
  };
}

export interface AnaliseCarteira {
  clientes: ClienteAtivo[];
  summary: { total_ativos: number; risco_alto: number };
  origem: "api" | "mock";
  detalheOrigem?: string;
}

function sortFila(clientes: ClienteAtivo[]): ClienteAtivo[] {
  return clientes.sort((a, b) => b.prioridade_financeira - a.prioridade_financeira);
}

/** Executa o POST no endpoint informado e normaliza a resposta. */
async function postAnalyze(endpoint: string, timeoutMs: number, signal?: AbortSignal, formData?: FormData): Promise<AnaliseCarteira> {
  const timeout = AbortSignal.timeout(timeoutMs);
  
  const reqInit: RequestInit = {
    method: "POST",
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  };

  if (formData) {
    reqInit.body = formData;
    // Omit Content-Type so browser sets boundary automatically
  } else {
    reqInit.headers = { "Content-Type": "application/json" };
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, reqInit);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as AnalyzeDbResponse;
  if (json.status !== "success") throw new Error(json.message ?? "Falha na análise");

  return {
    clientes: sortFila(json.data.map(mapFilaItem)),
    summary: json.summary,
    origem: "api",
    detalheOrigem: endpoint === "/analyze_excel" ? "IA Dinâmica" : "SQL Server",
  };
}

const baseMockada = (): AnaliseCarteira => ({
  clientes: clientesMock,
  summary: {
    total_ativos: 58,
    risco_alto: clientesMock.filter((c) => c.score_risco > 60).length,
  },
  origem: "mock",
  detalheOrigem: "Base local da última análise",
});

/**
 * Gera a fila priorizada: /analyze_excel (IA) com fallback local.
 */
export async function analyzeExcel(
  formData?: FormData,
  signal?: AbortSignal,
): Promise<AnaliseCarteira> {
  try {
    // 30s timeout since AI can take time to process large files
    return await postAnalyze("/analyze_excel", 30_000, signal, formData);
  } catch (err) {
    console.error("API error:", err);
    return baseMockada();
  }
}

/** Compatibilidade: análise direta no SQL Server (usada pela query inicial). */
export async function analyzeDb(signal?: AbortSignal): Promise<AnaliseCarteira> {
  try {
    return await postAnalyze("/analyze_db", 4_000, signal);
  } catch {
    return baseMockada();
  }
}

/** Alimenta o feedback loop do modelo de Machine Learning. */
export async function enviarPostMortem(payload: PostMortem): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/post_mortem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Registra uma ação de CS (QBR, escalonamento N3, atendimento). */
export async function registrarAcao(
  cliente_id: string,
  acao: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/acoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente_id, acao, registrado_em: new Date().toISOString() }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
