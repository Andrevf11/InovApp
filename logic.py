import os
import pandas as pd
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

class ChurnAnalyzer:
    def __init__(self):
        self.clientes = None
        self.atendimentos = None
        self.nps = None
        self.situacao = None
        self.resultados = []

    def load_data(self):
        """Carrega os dados a partir do arquivo Excel (base_hackathon.xlsx)."""
        print("Carregando dados da planilha Excel...")
        
        arquivo_excel = 'base_hackathon.xlsx'
        
        self.clientes = pd.read_excel(arquivo_excel, sheet_name='clientes')
        self.atendimentos = pd.read_excel(arquivo_excel, sheet_name='atendimento_mensal')
        self.nps = pd.read_excel(arquivo_excel, sheet_name='pesquisas_nps')
        self.situacao = pd.read_excel(arquivo_excel, sheet_name='situacao_clientes')
        
        # Converte datas
        self.atendimentos['mes_ref'] = pd.to_datetime(self.atendimentos['mes_ref'])
        self.nps['mes_ref'] = pd.to_datetime(self.nps['mes_ref'])

    def analyze_client(self, df_client_hist, df_nps_hist, cliente_info):
        """
        Analisa o histórico de 1 cliente para identificar sinais de deterioração (Risco Comportamental)
        e o padrão de 'Silêncio Qualificado'.
        """
        if df_client_hist.empty:
            return 0, []

        df_client_hist = df_client_hist.sort_values('mes_ref')
        
        # Considerar os últimos 3-6 meses para análise de tendência (para evitar falsos positivos de variações pontuais)
        recent_hist = df_client_hist.tail(6)
        if len(recent_hist) < 2:
            return 0, [], False

        evidencias = []
        score_risco = 0
        silencio_qualificado = False

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

        # 6. NPS (Satisfação e ausência de resposta / Silêncio Qualificado)
        if not df_nps_hist.empty:
            df_nps_hist = df_nps_hist.sort_values('mes_ref')
            nps_recente = df_nps_hist.iloc[-1]
            
            if nps_recente['respondeu'] == 0:
                score_risco += 10
                evidencias.append("Cliente parou de responder a pesquisa NPS")
                
                # Checar se no passado houve nota negativa formal (Silêncio Qualificado)
                if len(df_nps_hist) > 1:
                    past_nps = df_nps_hist.iloc[:-1]
                    if past_nps[past_nps['classificacao_nps'].isin(['Detrator', 'Neutro'])].shape[0] > 0:
                        score_risco += 20
                        evidencias.append("[ALERTA] Silêncio Qualificado: Parou de responder após dar avaliações negativas/neutras")
                        silencio_qualificado = True
                        
            elif nps_recente['classificacao_nps'] == 'Detrator':
                score_risco += 15
                evidencias.append(f"NPS Detrator (Nota: {nps_recente['nota_nps']})")
                
        # Normalizando score (máx 100 approx)
        score_risco = min(score_risco, 100)
        return score_risco, evidencias, silencio_qualificado

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

            score_risco, evidencias, silencio_qualificado = self.analyze_client(df_hist, df_nps, client_info)
            
            valor_mensal = client_info['valor_mensal']
            porte = client_info.get('porte', 'Desconhecido')
            plano = client_info.get('plano', '')
            
            is_grande = porte == 'Grande'
            is_vip = plano in ['Avançado', 'Avancado', 'Enterprise']
            is_pequeno = porte == 'Pequeno'

            # Prioridade Operacional Base
            impacto_financeiro = (valor_mensal / 1000)
            urgencia_fila = score_risco * (1 + (impacto_financeiro * 0.05))
            
            # MATRIZ HÍBRIDA DE PRIORIZAÇÃO (Porte x Valor)
            if is_grande or is_vip:
                urgencia_fila *= 1.5  # Bônus de urgência para contas grandes/vip
            elif is_pequeno and not is_vip:
                urgencia_fila *= 0.8  # Redução de prioridade para contas pequenas em planos básicos

            if score_risco > 0:
                acao = self.sugerir_acao(score_risco, evidencias, silencio_qualificado, is_grande or is_vip)
                segmento = client_info.get('segmento', '')
                palavras_chave = self.extrair_palavras_chave_ia(client_id, segmento, porte, plano, is_grande or is_vip)
                
                resultados_ativos.append({
                    'cliente_id': client_id,
                    'porte': porte,
                    'segmento': client_info.get('segmento', ''),
                    'plano': plano,
                    'valor_mensal': valor_mensal,
                    'score_risco': score_risco,
                    'urgencia_fila': round(urgencia_fila, 2),
                    'evidencias': " | ".join(evidencias),
                    'palavras_chave': palavras_chave,
                    'acao_recomendada': acao
                })

        # Ordena a fila da maior urgência para a menor
        self.resultados = sorted(resultados_ativos, key=lambda x: x['urgencia_fila'], reverse=True)
        return self.resultados

    def sugerir_acao(self, score, evidencias, silencio_qualificado, is_vip):
        """Gera uma sugestão de ação baseada nas evidências e no nível do problema."""
        ev_str = " ".join(evidencias).lower()
        acao_base = ""
        
        if silencio_qualificado:
            acao_base = "Enviar WhatsApp Semanal (Ação Proativa Anti-Silêncio) e investigar reclamações."
        elif score > 80:
            acao_base = "ALERTA VERMELHO: Ligar imediatamente para renegociação e plano de ação técnico"
        elif "atraso financeiro" in ev_str:
            acao_base = "Revisar situação financeira e oferecer flexibilização (desconto pontual)"
        elif "chamados críticos" in ev_str or "sla" in ev_str:
            acao_base = "Agendar reunião técnica de revisão (Customer Success + TI)"
        elif "nps" in ev_str or "uso" in ev_str:
            acao_base = "Contato do CS para plano de engajamento na plataforma"
        else:
            acao_base = "Acompanhar de perto"
            
        if is_vip:
            return f"[VIP Humanizado] {acao_base}"
        return acao_base
        
    def extrair_palavras_chave_ia(self, client_id, segmento, porte, plano, is_vip):
        """
        Módulo NLP Real usando Google Gemini.
        Gera palavras-chave que representam problemas típicos daquele segmento e porte,
        simulando a leitura de formulários do cliente.
        """
        if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "coloque_sua_chave_aqui":
            # Fallback caso não haja chave configurada
            if is_vip:
                return "Lentidão relatórios, Erro integração API, Suporte demorado"
            return "Dúvida sistema, Dificuldade login"
            
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            # Construindo o prompt de simulação
            prompt = (
                f"Aja como um analista de Customer Success. Eu tenho um cliente B2B do segmento de {segmento}, "
                f"porte {porte} e que utiliza o plano {plano}. "
                f"Imagine que este cliente nos enviou feedbacks textuais semanais com reclamações e dores. "
                f"Gere exatamente 3 palavras-chave (ou pequenas expressões de até 3 palavras cada) que "
                f"representem os principais problemas relatados por esse perfil de cliente. "
                f"Retorne apenas as palavras separadas por vírgula. Não adicione nenhum texto extra ou saudação."
            )
            
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Erro ao consultar o Gemini: {e}")
            return "Indisponível no momento"

if __name__ == "__main__":
    # Teste rápido no terminal via SQL Server
    try:
        analyzer = ChurnAnalyzer()
        analyzer.load_data()
        fila = analyzer.processar_ativos()
        
        print(f"\n--- FILA DE PRIORIDADE (TOP 5) ---")
        for i, f in enumerate(fila[:5]):
            print(f"#{i+1} Cliente {f['cliente_id']} | Score Risco: {f['score_risco']} | Valor: R$ {f['valor_mensal']}")
            print(f"Evidências: {f['evidencias']}")
            print(f"Ação: {f['acao_recomendada']}\n")
    except Exception as e:
        print(f"Erro ao conectar ou analisar banco: {e}")
