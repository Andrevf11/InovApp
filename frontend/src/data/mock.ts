import type { ClienteAtivo } from "@/types/inova";

/**
 * Matriz de SLA Adaptativo por PLANO contratado.
 * Porte (Grande/Médio/Pequeno) = poderio financeiro da empresa.
 * Plano = pacote contratado que define o SLA:
 *   Essencial  → contrato 24h → máximo 22h
 *   Avançado   → contrato 12h → máximo 10h
 *   Enterprise → contrato 6h  → máximo 4h
 * Margem de erro FIXA: 2h. Tempo máximo = contrato − margem de erro.
 * Atendimentos NÃO podem ultrapassar o tempo máximo.
 */
export const MARGEM_ERRO_H = 2;

export const matrizSla: Record<string, { sla_limite_h: number; margem_erro_h: number; tempo_maximo_h: number }> = {
  Essencial: { sla_limite_h: 24, margem_erro_h: MARGEM_ERRO_H, tempo_maximo_h: 22 },
  Avancado: { sla_limite_h: 12, margem_erro_h: MARGEM_ERRO_H, tempo_maximo_h: 10 },
  "Avançado": { sla_limite_h: 12, margem_erro_h: MARGEM_ERRO_H, tempo_maximo_h: 10 },
  Enterprise: { sla_limite_h: 6, margem_erro_h: MARGEM_ERRO_H, tempo_maximo_h: 4 },
};


/**
 * Resultado exato da última execução do motor Python + IA sobre a base real
 * (58 clientes ativos). Top 5 líderes de prioridade financeira.
 */
export const clientesMock: ClienteAtivo[] = [
  {
    cliente_id: "C071",
    segmento: "Varejo",
    porte: "Grande",
    plano: "Enterprise",
    urgencia_fila: "Alta",
    tempo_resposta_h: 3.8,
    valor_mensal: 33881,
    score_risco: 65,
    prioridade_financeira: 2202265,
    pct_sla_cumprido: 60,
    sla_contratado_pct: 95,
    uso_plataforma_pct: 72.4,
    chamados_reabertos: 4,
    chamados_criticos: 3,
    reclamacoes_formais: 5,
    dias_atraso_pagamento: 11,
    nps_status: "Não respondeu à pesquisa",
    acao_prescritiva:
      "[VIP Humanizado] Reunião Executiva (QBR) + Alocação de Especialista em Arquitetura",
    palavras_chave: ["#ReclamacaoFormal", "#SLA_Estourado", "#AtrasoFinanceiro", "#SilencioNPS"],
    evidencias: [
      "5 reclamações formais no trimestre",
      "SLA em deterioração (60.0% cumprido recentemente)",
      "Atraso financeiro crítico (11 dias)",
      "Cliente parou de responder à pesquisa NPS",
    ],
    trajetoria: [
      { mes_ref: "Abr", pct_sla_cumprido: 88, uso_plataforma_pct: 84, dias_atraso_pagamento: 2, nota_nps: 7 },
      { mes_ref: "Mai", pct_sla_cumprido: 71, uso_plataforma_pct: 78, dias_atraso_pagamento: 6, nota_nps: 5 },
      { mes_ref: "Jun", pct_sla_cumprido: 60, uso_plataforma_pct: 72, dias_atraso_pagamento: 11, nota_nps: null },
    ],
  },
  {
    cliente_id: "C061",
    segmento: "Varejo",
    porte: "Grande",
    plano: "Enterprise",
    urgencia_fila: "Média",
    tempo_resposta_h: 3.2,
    valor_mensal: 36148,
    score_risco: 57,
    prioridade_financeira: 2060436,
    pct_sla_cumprido: 75.1,
    sla_contratado_pct: 95,
    uso_plataforma_pct: 81.2,
    chamados_reabertos: 5,
    chamados_criticos: 5,
    reclamacoes_formais: 2,
    dias_atraso_pagamento: 7,
    nps_status: "Detrator",
    acao_prescritiva:
      "Auditoria no Suporte Técnico: revisar a causa-raiz dos 5 chamados críticos reabertos com o time N2 e devolver um plano de correção formal ao cliente em até 7 dias.",
    palavras_chave: ["#ChamadosCriticos", "#ReaberturaRecorrente", "#AtrasoFinanceiro", "#DetratorNPS"],
    evidencias: [
      "Alta incidência de chamados críticos (5 recentes)",
      "Aumento de chamados reabertos (5 recentes)",
      "SLA em deterioração (75.1% cumprido recentemente)",
      "Atraso financeiro (7 dias)",
    ],
    trajetoria: [
      { mes_ref: "Abr", pct_sla_cumprido: 93, uso_plataforma_pct: 89, dias_atraso_pagamento: 0, nota_nps: 8 },
      { mes_ref: "Mai", pct_sla_cumprido: 84, uso_plataforma_pct: 85, dias_atraso_pagamento: 3, nota_nps: 6 },
      { mes_ref: "Jun", pct_sla_cumprido: 75.1, uso_plataforma_pct: 81.2, dias_atraso_pagamento: 7, nota_nps: 4 },
    ],
  },
  {
    cliente_id: "C010",
    segmento: "Varejo",
    porte: "Grande",
    plano: "Enterprise",
    urgencia_fila: "Média",
    tempo_resposta_h: 3.6,
    valor_mensal: 31510,
    score_risco: 57,
    prioridade_financeira: 1796070,
    pct_sla_cumprido: 57.1,
    sla_contratado_pct: 95,
    uso_plataforma_pct: 76.8,
    chamados_reabertos: 3,
    chamados_criticos: 2,
    reclamacoes_formais: 3,
    dias_atraso_pagamento: 7,
    nps_status: "Não respondeu à pesquisa",
    acao_prescritiva:
      "Intervenção Operacional de Suporte: força-tarefa dedicada para recompor o SLA acima de 90% e contato do CS para reativar a resposta à pesquisa NPS.",
    palavras_chave: ["#SLA_Estourado", "#ReclamacaoFormal", "#SilencioNPS"],
    evidencias: [
      "SLA em deterioração (57.1% cumprido em junho)",
      "3 reclamações formais",
      "Atraso financeiro (7 dias)",
      "Cliente parou de responder à pesquisa NPS",
    ],
    trajetoria: [
      { mes_ref: "Abr", pct_sla_cumprido: 82, uso_plataforma_pct: 83, dias_atraso_pagamento: 1, nota_nps: 7 },
      { mes_ref: "Mai", pct_sla_cumprido: 69, uso_plataforma_pct: 80, dias_atraso_pagamento: 4, nota_nps: 6 },
      { mes_ref: "Jun", pct_sla_cumprido: 57.1, uso_plataforma_pct: 76.8, dias_atraso_pagamento: 7, nota_nps: null },
    ],
  },
  {
    cliente_id: "C052",
    segmento: "Saúde",
    porte: "Grande",
    plano: "Avançado",
    urgencia_fila: "Média",
    tempo_resposta_h: 2.8,
    valor_mensal: 28195,
    score_risco: 55,
    prioridade_financeira: 1550725,
    pct_sla_cumprido: 88.4,
    sla_contratado_pct: 95,
    uso_plataforma_pct: 64.1,
    chamados_reabertos: 2,
    chamados_criticos: 1,
    reclamacoes_formais: 1,
    dias_atraso_pagamento: 11,
    nps_status: "Não respondeu à pesquisa",
    acao_prescritiva:
      "Alinhamento Financeiro Executivo: reunião com o financeiro do cliente para tratar o atraso recorrente de 11 dias e revisar condições contratuais antes da renovação.",
    palavras_chave: ["#AtrasoFinanceiro", "#QuedaDeUso", "#SilencioNPS"],
    evidencias: [
      "Atraso financeiro crítico recorrente (11 dias)",
      "Queda de engajamento na plataforma",
      "Cliente parou de responder à pesquisa NPS",
    ],
    trajetoria: [
      { mes_ref: "Abr", pct_sla_cumprido: 94, uso_plataforma_pct: 81, dias_atraso_pagamento: 9, nota_nps: 8 },
      { mes_ref: "Mai", pct_sla_cumprido: 91, uso_plataforma_pct: 72, dias_atraso_pagamento: 10, nota_nps: 6 },
      { mes_ref: "Jun", pct_sla_cumprido: 88.4, uso_plataforma_pct: 64.1, dias_atraso_pagamento: 11, nota_nps: null },
    ],
  },
  {
    cliente_id: "C080",
    segmento: "Varejo",
    porte: "Grande",
    plano: "Enterprise",
    urgencia_fila: "Alta",
    tempo_resposta_h: 3.9,
    valor_mensal: 20924,
    score_risco: 68,
    prioridade_financeira: 1422832,
    pct_sla_cumprido: 61.3,
    sla_contratado_pct: 95,
    uso_plataforma_pct: 69.5,
    chamados_reabertos: 11,
    chamados_criticos: 4,
    reclamacoes_formais: 2,
    dias_atraso_pagamento: 13,
    nps_status: "Detrator",
    acao_prescritiva:
      "Re-onboarding Urgente dos Utilizadores: trilha de capacitação nas 3 áreas com maior queda de uso + squad de estabilização para zerar os 11 chamados reabertos.",
    palavras_chave: ["#QuedaDeUso", "#SLA_Estourado", "#ReaberturaRecorrente", "#AtrasoFinanceiro"],
    evidencias: [
      "SLA em deterioração (61.3% cumprido recentemente)",
      "Queda de uso da plataforma (para 69.5%)",
      "Aumento de chamados reabertos (11 recentes)",
      "Atraso financeiro crítico (13 dias)",
    ],
    trajetoria: [
      { mes_ref: "Abr", pct_sla_cumprido: 86, uso_plataforma_pct: 92, dias_atraso_pagamento: 3, nota_nps: 7 },
      { mes_ref: "Mai", pct_sla_cumprido: 74, uso_plataforma_pct: 80, dias_atraso_pagamento: 8, nota_nps: 5 },
      { mes_ref: "Jun", pct_sla_cumprido: 61.3, uso_plataforma_pct: 69.5, dias_atraso_pagamento: 13, nota_nps: 3 },
    ],
  },
];

/** Ação VIP Humanizada da conta líder — destaque roxo/dourado na fila. */
export const acoesVipPorCliente: Record<string, string> = {
  C071: "[VIP Humanizado] Reunião Executiva (QBR) + Alocação de Especialista em Arquitetura",
};

export interface ContaSilencio {
  cliente_id: string;
  segmento: string;
  porte: string;
  valor_mensal: number;
  dias_sem_contato: number;
  dias_sem_chamados: number;
  dias_sem_reunioes: number;
  ultimo_canal: string;
  cs_responsavel: string;
}

/** Empresas ativas sem interação, chamados ou reuniões há mais de 14 dias. */
export const silencioMock: ContaSilencio[] = [
  { cliente_id: "C034", segmento: "Varejo", porte: "Médio", valor_mensal: 12500, dias_sem_contato: 27, dias_sem_chamados: 31, dias_sem_reunioes: 45, ultimo_canal: "E-mail", cs_responsavel: "Ana Lima" },
  { cliente_id: "C045", segmento: "Saúde", porte: "Grande", valor_mensal: 18900, dias_sem_contato: 22, dias_sem_chamados: 26, dias_sem_reunioes: 38, ultimo_canal: "Telefone", cs_responsavel: "Rafael Souza" },
  { cliente_id: "C088", segmento: "Logística", porte: "Médio", valor_mensal: 9800, dias_sem_contato: 19, dias_sem_chamados: 24, dias_sem_reunioes: 30, ultimo_canal: "WhatsApp", cs_responsavel: "Ana Lima" },
  { cliente_id: "C012", segmento: "Educação", porte: "Pequeno", valor_mensal: 4200, dias_sem_contato: 18, dias_sem_chamados: 40, dias_sem_reunioes: 52, ultimo_canal: "E-mail", cs_responsavel: "Bruno Costa" },
  { cliente_id: "C095", segmento: "Varejo", porte: "Grande", valor_mensal: 22400, dias_sem_contato: 16, dias_sem_chamados: 21, dias_sem_reunioes: 28, ultimo_canal: "Telefone", cs_responsavel: "Rafael Souza" },
  { cliente_id: "C023", segmento: "Indústria", porte: "Médio", valor_mensal: 14750, dias_sem_contato: 15, dias_sem_chamados: 15, dias_sem_reunioes: 33, ultimo_canal: "WhatsApp", cs_responsavel: "Bruno Costa" },
];

export const kpisCarteira = {
  mrr_ativo: 707998,
  clientes_ativos: 58,
  risco_alto: 3,
  receita_risco_alto: 138650,
  meta_arr_preservado: 660000,
  contas_alerta_amarelo: 12,
};

/**
 * Módulo Crescimento & Relacionamento — evolução do engajamento da carteira.
 * Índice de engajamento = média ponderada (uso, SLA, NPS, financeiro) 0-100.
 */
export const evolucaoEngajamento = [
  { mes: "Jan", engajamento: 81, receita_preservada: 512000, contas_ativas: 54 },
  { mes: "Fev", engajamento: 78, receita_preservada: 534000, contas_ativas: 55 },
  { mes: "Mar", engajamento: 76, receita_preservada: 561000, contas_ativas: 56 },
  { mes: "Abr", engajamento: 73, receita_preservada: 589000, contas_ativas: 56 },
  { mes: "Mai", engajamento: 68, receita_preservada: 617000, contas_ativas: 57 },
  { mes: "Jun", engajamento: 62, receita_preservada: 641000, contas_ativas: 58 },
];

/** Plano de relacionamento calculado: [MRR + Risco + Importância → Plano] */
export const planosRelacionamento = [
  {
    cliente_id: "C071",
    mrr: 33881,
    risco_distanciamento: "Crítico",
    importancia_estrategica: "Alta",
    plano: "Relacionamento VIP Humanizado — QBR mensal + especialista dedicado",
  },
  {
    cliente_id: "C061",
    mrr: 36148,
    risco_distanciamento: "Alto",
    importancia_estrategica: "Alta",
    plano: "Plano de Reação Técnica — auditoria N3 + plano de correção formal",
  },
  {
    cliente_id: "C010",
    mrr: 31510,
    risco_distanciamento: "Alto",
    importancia_estrategica: "Média",
    plano: "Plano Operacional — força-tarefa de SLA + reativação NPS",
  },
  {
    cliente_id: "C052",
    mrr: 28195,
    risco_distanciamento: "Alto",
    importancia_estrategica: "Média",
    plano: "Plano Financeiro-Executivo — comitê de faturamento + revisão contratual",
  },
  {
    cliente_id: "C080",
    mrr: 20924,
    risco_distanciamento: "Crítico",
    importancia_estrategica: "Média",
    plano: "Plano de Re-onboarding — capacitação dirigida + squad de estabilização",
  },
];

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const formatNum = (v: number) => v.toLocaleString("pt-BR");
