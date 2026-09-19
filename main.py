import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from logic import ChurnAnalyzer

app = FastAPI()

# Configuração de Arquivos Estáticos e Templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Objeto global provisório para manter o resultado na memória no MVP
fila_atendimento_global = []

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    # Passamos os dados globais para o dashboard para ele decidir qual view renderizar
    return templates.TemplateResponse("index.html", {
        "request": request,
        "has_data": len(fila_atendimento_global) > 0
    })

@app.post("/analyze_db")
async def analyze_db():
    """Rota para processar os dados do banco SQL Server usando o algoritmo do Hackathon."""
    global fila_atendimento_global
    try:
        analyzer = ChurnAnalyzer()
        analyzer.load_sql()  # Chama a leitura do SQL Server de conexao.py
        fila = analyzer.processar_ativos()
        
        # Armazena globalmente (para o MVP de demonstração rápida)
        fila_atendimento_global = fila
        
        return {"status": "success", "message": "Análise concluída com sucesso! Redirecionando para a fila de atendimento..."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/fila", response_class=HTMLResponse)
async def get_fila(request: Request):
    """Retorna o MVP da Fila de Atendimento."""
    # Resumo para o dashboard top
    total_ativos = 58 # fixo da base ou calcular
    risco_alto = len([c for c in fila_atendimento_global if c['score_risco'] > 60])
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request, 
        "fila": fila_atendimento_global,
        "total_ativos": total_ativos,
        "risco_alto": risco_alto
    })
