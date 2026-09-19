from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from database import Base

class Cliente(Base):
    __tablename__ = "clientes"
    cliente_id = Column(String, primary_key=True, index=True)
    segmento = Column(String)
    porte = Column(String)
    plano = Column(String)
    valor_mensal = Column(Integer)
    sla_contratado_h = Column(Integer)
    inicio_contrato = Column(String)

class AtendimentoMensal(Base):
    __tablename__ = "atendimento_mensal"
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(String, ForeignKey("clientes.cliente_id"))
    mes_ref = Column(String)
    chamados_abertos = Column(Integer)
    chamados_criticos = Column(Integer)
    chamados_reabertos = Column(Integer)
    chamados_dentro_sla = Column(Integer)
    pct_sla_cumprido = Column(Float)
    tempo_medio_resolucao_h = Column(Float)
    reclamacoes_formais = Column(Integer)
    uso_plataforma_pct = Column(Float)
    dias_atraso_pagamento = Column(Integer)
    reunioes_previstas = Column(Integer)
    reunioes_realizadas = Column(Integer)

class PesquisaNPS(Base):
    __tablename__ = "pesquisas_nps"
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(String, ForeignKey("clientes.cliente_id"))
    mes_ref = Column(String)
    respondeu = Column(Integer)
    nota_nps = Column(Integer, nullable=True)
    classificacao_nps = Column(String, nullable=True)

class SituacaoCliente(Base):
    __tablename__ = "situacao_clientes"
    cliente_id = Column(String, ForeignKey("clientes.cliente_id"), primary_key=True)
    situacao = Column(String)
    mes_cancelamento = Column(String, nullable=True)

# Armazenamento de Análise de Risco (Gerado pela IA)
class RiscoCliente(Base):
    __tablename__ = "risco_clientes"
    cliente_id = Column(String, ForeignKey("clientes.cliente_id"), primary_key=True)
    score_risco = Column(Float)
    evidencias = Column(String)
    acoes_recomendadas = Column(String)
