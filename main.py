import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from logic import ChurnAnalyzer

app = FastAPI(title="InovaApps 2026 API")

# Habilitar CORS para permitir que o frontend do Lovable acesse esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em prod, restringir aos domínios corretos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API do InovaApps 2026 (Hackathon) está rodando."}

@app.post("/analyze_db")
async def analyze_db():
    """Rota REST pura: Processa o SQL Server e retorna a fila em JSON."""
    try:
        analyzer = ChurnAnalyzer()
        analyzer.load_sql()  # Lê do SQL Server usando conexao.py
        fila = analyzer.processar_ativos()
        
        total_ativos = 58
        risco_alto = len([c for c in fila if c['score_risco'] > 60])
        
        return JSONResponse(content={
            "status": "success",
            "summary": {
                "total_ativos": total_ativos,
                "risco_alto": risco_alto
            },
            "data": fila
        })
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
