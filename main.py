import os
from fastapi import FastAPI, File, UploadFile, Form
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

@app.post("/analyze_excel")
async def analyze_excel(
    file: UploadFile = File(...),
    system_name: str = Form(""),
    criteria: str = Form(""),
    priorities: str = Form("")
):
    """Rota REST: Recebe o arquivo Excel via Upload e os parâmetros de Setup para treinar a IA."""
    try:
        # Lê o arquivo recebido na requisição em memória
        conteudo = await file.read()
        
        analyzer = ChurnAnalyzer()
        fila = analyzer.processar_ativos(conteudo, system_name, criteria, priorities)
        
        # O Total é dinâmico agora
        total_ativos = len(fila)
        risco_alto = len([c for c in fila if c.get('score_risco', 0) > 60])
        
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
