import pandas as pd
import numpy as np

class ChurnAnalyzer:
    def __init__(self):
        self.clientes = None
        self.atendimentos = None
        self.nps = None
        self.situacao = None
        self.resultados = []

    def load_sql(self):
        """Carrega os dados a partir do banco SQL Server configurado em conexao.py."""
        print("Carregando dados do banco SQL Server...")
        from conexao import conexao
        self.clientes = pd.read_sql_query("SELECT * FROM clientes", conexao)
        self.atendimentos = pd.read_sql_query("SELECT * FROM atendimento_mensal", conexao)
        self.nps = pd.read_sql_query("SELECT * FROM pesquisas_nps", conexao)
        self.situacao = pd.read_sql_query("SELECT * FROM situacao_clientes", conexao)
        
        # Converte datas (SQL Server pode retornar string ou date)
        self.atendimentos['mes_ref'] = pd.to_datetime(self.atendimentos['mes_ref'], format='%Y-%m')
        self.nps['mes_ref'] = pd.to_datetime(self.nps['mes_ref'], format='%Y-%m')

    def analyze_client(self, df_client_hist, df_nps_hist, cliente_info):
        """
        Analisa o histórico de 1 cliente para identificar sinais de deterioração (Risco Comportamental).
        """
        if df_client_hist.empty:
            return 0, []

        df_client_hist = df_client_hist.sort_values('mes_ref')
        
        # Considerar os últimos 3-6 meses para análise de tendência (para evitar falsos positivos de variações pontuais)
        recent_hist = df_client_hist.tail(6)
        if len(recent_hist) < 2:
            return 0, []

        evidencias = []
        score_risco = 0

        # 1. Uso da Plataforma (Queda sustentada)
        if 'uso_plataforma_pct' in recent_hist.columns:
            uso_inicio = recent_hist['uso_plataforma_pct'].iloc[:3].mean()
            uso_fim = recent_hist['uso_plataforma_pct'].iloc[-3:].mean()
            if uso_fim < uso_inicio * 0.8: # Queda de mais de 20%
                score_risco += 25
                evidencias.append(f"Queda de uso da plataforma: de {uso_inicio:.0f}% para {uso_fim:.0f}%")

        # 2. Suporte (Chamados Críticos e Reabertos)
        chamados_criticos_fim = recent_hist['chamados_criticos'].iloc[-3:].sum()
        chamados_reabertos_fim = recent_hist['chamados_reabertos'].iloc[-3:].sum()
        
        if chamados_criticos_fim > 3:
            score_risco += 15
            evidencias.append(f"Alta incidência de chamados críticos ({chamados_criticos_fim} recentes)")
            
        if chamados_reabertos_fim > 2:
            score_risco += 15
            evidencias.append(f"Aumento de chamados reabertos ({chamados_reabertos_fim} recentes)")

        # 3. SLA (Queda no % cumprido)
        if 'pct_sla_cumprido' in recent_hist.columns:
            sla_fim = recent_hist['pct_sla_cumprido'].iloc[-3:].mean()
            if sla_fim < 90:
                score_risco += 15
                evidencias.append(f"SLA em deterioração ({sla_fim:.1f}% cumprido recentemente)")

        # 4. Financeiro (Dias de atraso)
        atraso_max = recent_hist['dias_atraso_pagamento'].max()
        if atraso_max > 10:
            score_risco += 20
            evidencias.append(f"Atraso financeiro crítico ({atraso_max} dias de atraso)")

        # 5. Relacionamento (Reuniões não realizadas)
        if 'reunioes_previstas' in recent_hist.columns and 'reunioes_realizadas' in recent_hist.columns:
            previstas = recent_hist['reunioes_previstas'].sum()
            realizadas = recent_hist['reunioes_realizadas'].sum()
            if previstas > 0 and realizadas == 0:
                score_risco += 10
                evidencias.append("Falta de engajamento em reuniões agendadas")

        # 6. NPS (Satisfação e ausência de resposta)
        if not df_nps_hist.empty:
            df_nps_hist = df_nps_hist.sort_values('mes_ref')
            nps_recente = df_nps_hist.iloc[-1]
            if nps_recente['respondeu'] == 0:
                score_risco += 10
                evidencias.append("Cliente parou de responder a pesquisa NPS")
            elif nps_recente['classificacao_nps'] == 'Detrator':
                score_risco += 15
                evidencias.append(f"NPS Detrator (Nota: {nps_recente['nota_nps']})")
                
        # Normalizando score (máx 100 approx)
        score_risco = min(score_risco, 100)
        return score_risco, evidencias

    def processar_ativos(self):
        """Processa apenas clientes ativos para gerar a fila de atendimento."""
        # Identificar ativos
        ativos = self.situacao[self.situacao['situacao'] == 'Ativo']['cliente_id'].tolist()
        print(f"Encontrados {len(ativos)} clientes ativos.")

        resultados_ativos = []

        for client_id in ativos:
            df_hist = self.atendimentos[self.atendimentos['cliente_id'] == client_id]
            df_nps = self.nps[self.nps['cliente_id'] == client_id]
            client_info = self.clientes[self.clientes['cliente_id'] == client_id].iloc[0]

            score_risco, evidencias = self.analyze_client(df_hist, df_nps, client_info)
            
            valor_mensal = client_info['valor_mensal']
            
            # Prioridade Operacional = Score * (Log(Valor Mensal) / Constante) -> Ponderação simples
            # O Hackathon diz: "Impacto financeiro: Levar o valor mensal do contrato para a priorização"
            # Multiplicamos o risco base pelo peso do valor do contrato para achar a 'Urgência'
            impacto_financeiro = (valor_mensal / 1000) # Normalizando para milhares de reais
            urgencia_fila = score_risco * (1 + (impacto_financeiro * 0.05))

            if score_risco > 0:
                acao = self.sugerir_acao(score_risco, evidencias)
                resultados_ativos.append({
                    'cliente_id': client_id,
                    'segmento': client_info['segmento'],
                    'plano': client_info['plano'],
                    'valor_mensal': valor_mensal,
                    'score_risco': score_risco,
                    'urgencia_fila': round(urgencia_fila, 2),
                    'evidencias': " | ".join(evidencias),
                    'acao_recomendada': acao
                })

        # Ordena a fila da maior urgência para a menor
        self.resultados = sorted(resultados_ativos, key=lambda x: x['urgencia_fila'], reverse=True)
        return self.resultados

    def sugerir_acao(self, score, evidencias):
        """Gera uma sugestão de ação baseada nas evidências e no nível do problema."""
        ev_str = " ".join(evidencias).lower()
        if score > 80:
            return "ALERTA VERMELHO: Ligar imediatamente para renegociação e plano de ação técnico"
        if "atraso financeiro" in ev_str:
            return "Revisar situação financeira e oferecer flexibilização (desconto pontual)"
        if "chamados críticos" in ev_str or "sla" in ev_str:
            return "Agendar reunião técnica de revisão (Customer Success + TI)"
        if "nps" in ev_str or "uso" in ev_str:
            return "Contato do CS para plano de engajamento na plataforma"
        
        return "Acompanhar de perto"

if __name__ == "__main__":
    # Teste rápido no terminal via SQL Server
    try:
        analyzer = ChurnAnalyzer()
        analyzer.load_sql()
        fila = analyzer.processar_ativos()
        
        print(f"\n--- FILA DE PRIORIDADE (TOP 5) ---")
        for i, f in enumerate(fila[:5]):
            print(f"#{i+1} Cliente {f['cliente_id']} | Score Risco: {f['score_risco']} | Valor: R$ {f['valor_mensal']}")
            print(f"Evidências: {f['evidencias']}")
            print(f"Ação: {f['acao_recomendada']}\n")
    except Exception as e:
        print(f"Erro ao conectar ou analisar banco: {e}")
