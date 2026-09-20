# Insight Pulse

Crie uma aplicação Dashboard SaaS B2B de Retenção de Clientes e Preservação de Receita chamada "Globalsys CS Pulse", projetada para ser a interface visual de um motor de Data Science em Python (FastAPI/SQL Server).

A interface deve ser moderna, limpa e executiva (Tema Escuro/SaaS Industrial), construída com React, Tailwind CSS, Shadcn/UI e Lucide Icons. Ela deve atender com perfeição ao "Teste de Completude" do Desafio INOVAAPPS 2026.

ESTRUTURA DE NAVEGAÇÃO E PÁGINAS:

1. HEADER & KPI CARDS (VISÃO GERAL DA CARTEIRA):

- Título do App: "Globalsys CS Pulse — Painel Diário de Preservação de Receita"

- Subtítulo: "Motor de Análise Preditiva e Diagnóstico Prescritivo de Churn"

- Top Cards de Métricas Consolidadas:

  * MRR Ativo Analisado: R$ 707.998,00 /mês (58 Clientes Ativos)

  * Receita Anual em Risco Alto: R$ 138.650,00 /mês

  * Meta de Retenção (ROI): Preservação de ~R$ 660.000,00/ano em ARR

  * Taxa de Inatividade/Silêncio: 12 Contas com Alerta Amarelo

2. FILA DE ATENDIMENTO PRIORITÁRIA (PAINEL DE AÇÃO DIÁRIA DO CS):

- Apresentar uma lista ordenada rigorosamente pela métrica 'prioridade_financeira' (Fórmula: Score de Risco x MRR).

- Cada card de cliente na fila deve exibir:

  * Posição na Fila (ex: 1º Lugar, 2º Lugar), ID do Cliente, Setor e Porte (ex: C071 — Varejo | Porte Grande).

  * Valor do Contrato (MRR em R$) e Score de Risco (0 a 100) com Badge visual (🔴 Alto Risco > 60, 🟡 Médio Risco 40-60, 🟢 Baixo Risco < 40).

  * Seção "Evidências e Gatilhos Identificados" (Ícones com contadores):

    - % SLA Cumprido vs Contratado (com alerta visual se < 75%)

    - Chamados Reabertos e Chamados Críticos

    - Reclamações Formais e Dias de Atraso Financeiro

    - Indicador de Pesquisa NPS / Status do Silêncio ("Não respondeu à pesquisa" destacado)

  * Seção "Ação Prescritiva Recomendada" (Texto em destaque instruindo o gestor sobre o que fazer).

  * Botões de Ação Rápida: [Agendar Reunião Executiva (QBR)], [Escalonar Suporte N3], [Registrar Atendimento].

3. MODAL DE DETALHES DO CLIENTE & TRAJETÓRIA DE RISCO (90 DIAS):

- Ao clicar num cliente, abrir um Modal com:

  * Gráfico de Linhas (Recharts) mostrando a Trajetória dos últimos 3 meses: Queda do SLA %, Queda do Uso da Plataforma %, Histórico de Atrasos e Notas do NPS.

  * Formulário "Post-Mortem / Feedback Loop": Campo para registar o motivo real de eventuais cancelamentos ou resolução de crises (para alimentar o modelo de Machine Learning do back-end Python).

4. MÓDULO DE ENGAJAMENTO & PULSE CHECKS (GAMIFICAÇÃO):

- Abas secundárias para:

  * Configurar "Pulse Checks": Pesquisas curtas de 1 clique no app para evitar a fadiga de formulários longos.

  * "Canal Gamificado de Ideias": Módulo onde o cliente envia sugestões de melhoria e ganha pontos/mimos no contrato.

5. INTEGRAÇÃO TÉCNICA E TIPAGEM TYPESCRIPT (FastAPI / SQL):

- Crie as interfaces TypeScript espelhando o modelo de dados Python (models.py / inova.sql):

  interface ClienteAtivo {

    cliente_id: string;

    segmento: string;

    porte: string;

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

  }

- Crie o serviço em `src/services/api.ts` para consumir a rota Python `POST/GET http://localhost:8000/analyze_db`.

6. DADOS MOCKADOS INICIAIS (RESULTADO EXATO DA ANÁLISE):

- Carregue por padrão os 5 clientes líderes de risco da base real:

  1. C071: Varejo Grande, R$ 33.881/mês, Score 65/100, Prioridade 2.202.265 pts. Evidências: 5 Reclamações, SLA 60%, 11 dias de atraso, Sem resposta NPS. Ação: Reunião Executiva (QBR) + Escalonamento N3.

  2. C061: Varejo Grande, R$ 36.148/mês, Score 57/100, Prioridade 2.060.436 pts. Evidências: 5 Chamados Críticos/Reabertos, SLA 75.1%, 7 dias de atraso. Ação: Auditoria no Suporte Técnico.

  3. C010: Varejo Grande, R$ 31.510/mês, Score 57/100, Prioridade 1.796.070 pts. Evidências: SLA 57.1% em junho, 3 Reclamações, 7 dias de atraso. Ação: Intervenção Operacional de Suporte.

  4. C052: Saúde Grande, R$ 28.195/mês, Score 55/100, Prioridade 1.550.725 pts. Evidências: 11 dias de atraso de pagamento recorrente, Queda de engajamento. Ação: Alinhamento Financeiro Executivo.

  5. C080: Varejo Grande, R$ 20.924/mês, Score 68/100, Prioridade 1.422.832 pts. Evidências: SLA 61.3%, Queda no Uso (69.5%), 11 Chamados Reabertos, 13 dias de atraso. Ação: Re-onboarding Urgente dos Utilizadores.

Lovable, estou te enviando a lógica completa do meu back-end em Python (main.py, logic.py) e a estrutura das tabelas do meu banco de dados (inova.sql). Por favor, analise a estrutura e adapte o front-end em React para consumir exatamente esses campos, tipos e rotas de API (/analyze_db). Crie também os tipos TypeScript idênticos às tabelas e modelos do Python

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bd4e1aae-7bda-4aab-827b-1edadfdc07ea).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
