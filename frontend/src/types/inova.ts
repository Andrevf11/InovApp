/**
 * Tipos TypeScript espelhando o back-end Python (models.py / inova.sql).
 * Fonte: SQL Server -> SQLAlchemy models -> FastAPI (/analyze_db, /analyze_excel)
 */

/** Tabela: Clientes */
export interface Cliente {
  cliente_id: string;
  segmento: string;
  porte: string;
  plano: string;
  valor_mensal: number;
  sla_contratado_h: number;
  inicio_contrato: string; // DATE (ISO)
}

/** Tabela: Atendimento_Mensal */
export interface AtendimentoMensal {
  id?: number;
  cliente_id: string;
  mes_ref: string; // 'YYYY-MM'
  chamados_abertos: number;
  chamados_criticos: number;
  chamados_reabertos: number;
  chamados_dentro_sla: number;
  pct_sla_cumprido: number;
  tempo_medio_resolucao_h: number;
  reclamacoes_formais: number;
  uso_plataforma_pct: number;
  dias_atraso_pagamento: number;
  reunioes_previstas: number;
  reunioes_realizadas: number;
}

/** Tabela: Pesquisas_NPS */
export type ClassificacaoNPS = "Promotor" | "Neutro" | "Detrator" | null;

export interface PesquisaNPS {
  id?: number;
  cliente_id: string;
  mes_ref: string; // 'YYYY-MM'
  respondeu: 0 | 1;
  nota_nps: number | null;
  classificacao_nps: ClassificacaoNPS;
}

/** Tabela: Situacao_Clientes */
export type SituacaoTipo = "Ativo" | "Cancelado";

export interface SituacaoCliente {
  cliente_id: string;
  situacao: SituacaoTipo;
  mes_cancelamento: string | null;
}

/** Tabela: risco_clientes (gerada pelo motor de análise) */
export interface RiscoCliente {
  cliente_id: string;
  score_risco: number;
  evidencias: string;
  acoes_recomendadas: string;
}

/**
 * Item da fila retornado por POST /analyze_excel e /analyze_db -> data[]
 * (logic.py -> ChurnAnalyzer.processar_ativos)
 */
export interface FilaItemAPI {
  cliente_id: string;
  segmento: string;
  plano: string;
  valor_mensal: number;
  score_risco: number;
  urgencia_fila: number;
  evidencias: string;
  acao_recomendada: string;
  palavras_chave?: string[];
}

/** Envelope da resposta de /analyze_excel e /analyze_db */
export interface AnalyzeDbResponse {
  status: "success" | "error";
  message?: string;
  summary: {
    total_ativos: number;
    risco_alto: number;
  };
  data: FilaItemAPI[];
}

/**
 * Modelo enriquecido usado pela interface (fila de atendimento).
 * prioridade_financeira = score_risco x valor_mensal (ponderação da urgência).
 */
export interface ClienteAtivo {
  cliente_id: string;
  segmento: string;
  porte: string;
  /** Plano contratado (campo 'plano' do back-end Python) */
  plano?: string;
  /** Urgência de fila calculada pelo motor (Alta / Média / Baixa) */
  urgencia_fila?: string;
  /** Tempo médio de resposta em horas (Matriz de SLA Adaptativo por Porte) */
  tempo_resposta_h?: number;
  valor_mensal: number;
  score_risco: number;
  prioridade_financeira: number;
  pct_sla_cumprido: number;
  chamados_reabertos: number;
  chamados_criticos: number;
  reclamacoes_formais: number;
  dias_atraso_pagamento: number;
  nps_status: string;
  acao_prescritiva: string;
  /** Palavras-chave extraídas pela IA (badges de sintomas) */
  palavras_chave?: string[];
  /** Campos complementares para o modal de trajetória */
  sla_contratado_pct?: number;
  uso_plataforma_pct?: number;
  evidencias?: string[];
  trajetoria?: PontoTrajetoria[];
}

export interface PontoTrajetoria {
  mes_ref: string;
  pct_sla_cumprido: number;
  uso_plataforma_pct: number;
  dias_atraso_pagamento: number;
  nota_nps: number | null;
}

export type NivelRisco = "alto" | "medio" | "baixo";

export function nivelRisco(score: number): NivelRisco {
  if (score > 60) return "alto";
  if (score >= 40) return "medio";
  return "baixo";
}

export interface PostMortem {
  cliente_id: string;
  tipo: "cancelamento" | "crise_resolvida" | "observacao";
  motivo_real: string;
  detalhe: string;
  registrado_em: string;
}
