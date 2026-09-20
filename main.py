import os
from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
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

class AcaoReq(BaseModel):
    cliente_id: str
    acao: str
    registrado_em: str

class PostMortemReq(BaseModel):
    cliente_id: str
    tipo: str
    motivo_real: str
    detalhe: str
    registrado_em: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API do InovaApps 2026 (Hackathon) está rodando."}

@app.post("/analyze_db")
async def analyze_db_fallback():
    """Rota de retrocompatibilidade para o primeiro carregamento silencioso do frontend. Força o fallback local no navegador."""
    return JSONResponse(content={"status": "error", "message": "Banco de dados desativado por segurança. Frontend usará os Mocks padrão."}, status_code=400)

@app.post("/acoes")
async def registrar_acao(req: AcaoReq):
    """Finge salvar a ação no banco, mas grava em arquivo texto (auditoria.log)"""
    with open("auditoria.log", "a", encoding="utf-8") as f:
        f.write(f"[{req.registrado_em}] ACAO - Cliente: {req.cliente_id} - Acao: {req.acao}\n")
    return {"status": "success", "message": "Ação registrada com sucesso no log de auditoria."}

@app.post("/post_mortem")
async def registrar_post_mortem(req: PostMortemReq):
    """Finge salvar o post-mortem no banco, mas grava em arquivo texto (auditoria.log)"""
    with open("auditoria.log", "a", encoding="utf-8") as f:
        f.write(f"[{req.registrado_em}] POST_MORTEM ({req.tipo}) - Cliente: {req.cliente_id} - Motivo: {req.motivo_real} - Detalhe: {req.detalhe}\n")
    return {"status": "success", "message": "Post-Mortem registrado com sucesso."}

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
