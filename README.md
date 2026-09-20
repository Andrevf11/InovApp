# InovaApps 2026 - Gestão Inteligente de Churn B2B 🚀

Bem-vindo ao repositório do **InovaApps 2026**, um projeto desenvolvido para revolucionar a forma como equipes de Customer Success (CS) analisam e mitigam o risco de cancelamento (Churn) de clientes B2B.

Este projeto foi construído focando na substituição de regras de negócio engessadas e bancos de dados complexos por uma **Análise 100% orientada a Inteligência Artificial** usando o Google Gemini.

## 🌟 O Problema Resolvido
Em operações B2B de médio e grande porte, identificar qual cliente vai cancelar é um desafio gigantesco. Métricas isoladas (NPS, tempo de resposta, tickets críticos) costumam ficar espalhadas. 

Nossa solução unifica esses dados através de uma planilha e os envia para o "Cérebro" do sistema (Gemini), que cruza todas as variáveis comportamentais para criar uma **Fila de Prioridade Inteligente** para os gerentes de conta atuarem preventivamente.

## 🏗️ Arquitetura do Sistema

O sistema foi arquitetado de forma extremamente ágil (ideal para Hackathons) e divide-se em 3 camadas:

1. **Base de Dados (Excel):**
   Utilizamos o `base_hackathon.xlsx` como fonte da verdade, permitindo que a área de negócios atualize os dados rapidamente sem precisar de queries SQL.
2. **Backend Engine (Python + FastAPI):**
   O `main.py` serve uma API REST levíssima. O módulo `logic.py` usa `pandas` para compilar o histórico de atendimentos e NPS, transformando tudo em contexto de linguagem natural.
3. **Cérebro de IA (Google Gemini 1.5 Flash):**
   O backend não possui cálculos de risco manuais. Ele envia o contexto bruto para a API do Google Gemini, que é instruído através de um Mega Prompt a gerar o Diagnóstico de Risco, Sintomas Chave e o Plano de Ação, retornando um JSON estruturado.
4. **Frontend (Lovable UI):**
   Uma interface moderna consome a rota `/analyze_excel` renderizando uma Dashboard rica em tempo real.

---

## 🛠️ Tecnologias Utilizadas

- **Python 3+**
- **FastAPI** (Para a construção da API REST)
- **Uvicorn** (Servidor ASGI)
- **Pandas** (Leitura e manipulação estruturada do Excel)
- **Google Generative AI SDK** (Integração com o Gemini 1.5 Flash)
- **Lovable** (Geração da interface Visual de impacto)

---

## ⚙️ Como Instalar e Rodar o Projeto Localmente

### 1. Clonar e preparar o ambiente
Abra o seu terminal e certifique-se de estar na pasta do projeto.

### 2. Instalar as dependências
```bash
pip install fastapi uvicorn pandas openpyxl google-generativeai python-dotenv
```

### 3. Configurar a Chave da IA (Opcional para a Apresentação)
Se desejar que a IA analise clientes reais, crie um arquivo `.env` na raiz do projeto com:
```env
GEMINI_API_KEY=sua_chave_aqui_comecando_com_AIza
```
> **Nota de Blindagem:** Se a chave for omitida, for inválida ou o limite da API for atingido durante a apresentação, o sistema possui um **Fallback automático** (Dados Simulados/Mock) implementado no `logic.py`. Ele garantirá que a rota devolva instantaneamente um JSON realista de 2 clientes críticos (C010 e C042), para que o Frontend renderize perfeitamente diante dos jurados sem causar Erro 500.

### 4. Rodar o Servidor
Para evitar conflitos com portas travadas, recomendamos rodar na porta 8001:
```bash
python -m uvicorn main:app --port 8001
```

O servidor estará disponível e a documentação interativa (Swagger) poderá ser acessada em:
👉 `http://127.0.0.1:8001/docs`

---

## 📡 Rota da API

### `POST /analyze_excel`
- **Descrição**: Processa o arquivo Excel, empacota os dados e envia ao Gemini.
- **Retorno Esperado**:
```json
{
  "status": "success",
  "summary": {
    "total_ativos": 58,
    "risco_alto": 2
  },
  "data": [
    {
      "cliente_id": "C010",
      "porte": "Grande",
      "plano": "Enterprise",
      "valor_mensal": 15000.0,
      "score_risco": 85,
      "urgencia_fila": 120,
      "evidencias": "[ALERTA] Silêncio Qualificado: Parou de responder...",
      "palavras_chave": "Lentidão, Suporte, SLA",
      "acao_recomendada": "[VIP Humanizado] Ligar imediatamente..."
    }
  ]
}
```

---

## 🚀 Diferenciais para o Hackathon
- **Zero Banco de Dados Relacional**: Fuga criativa do SQL para manipulação nativa de contexto via LLM.
- **Integração Real-Time**: IA operando como "tomadora de decisão" no meio do fluxo, e não apenas como um chatbot anexado à aplicação.
- **Plano Anti-Falha**: A arquitetura prevê instabilidade de chaves (Fallback JSON), garantindo que a apresentação visual aconteça com 100% de fluidez.