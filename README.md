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

## Documentação técnica

### Fluxo de execução

```text
Upload Excel
  |
  v
POST /analyze_excel
  |
  v
ChurnAnalyzer.processar_ativos()
  |
  +--> leitura das quatro abas com Pandas
  |       clientes
  |       atendimento_mensal
  |       pesquisas_nps
  |       situacao_clientes
  |
  +--> seleção de clientes com situacao == "Ativo"
  |
  +--> consolidação dos três últimos registros de atendimento e NPS
  |
  +--> análise do Gemini e retorno JSON
  |       ou
  +--> fallback local quando a IA falha
  |
  v
Resposta com resumo, score, evidências e ação recomendada
```

### Responsabilidades dos módulos

| Arquivo | Responsabilidade |
| --- | --- |
| `main.py` | Cria a aplicação FastAPI, configura CORS e expõe o endpoint de análise. |
| `logic.py` | Lê a planilha, consolida o contexto, chama o Gemini e aplica o fallback. |
| `templates/` | Contém as páginas HTML da interface. |
| `static/` | Contém os estilos e scripts do frontend. |
| `requirements.txt` | Declara as dependências Python do projeto. |
| `inova.sql`, `conexao.py`, `database.py` | Artefatos de persistência e integração disponíveis para futuras evoluções. |

### Contrato de entrada

O endpoint `POST /analyze_excel` recebe `multipart/form-data` com:

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `file` | Excel | Sim | Planilha com as quatro abas esperadas. |
| `system_name` | Texto | Não | Nome do sistema usado no prompt. |
| `criteria` | Texto | Não | Critérios adicionais de risco. |
| `priorities` | Texto | Não | Diretrizes adicionais de priorização. |

As abas esperadas são:

- `clientes`: identificação, porte, plano e valor mensal;
- `atendimento_mensal`: cliente, SLA, chamados críticos e uso da plataforma;
- `pesquisas_nps`: cliente, resposta e nota NPS;
- `situacao_clientes`: cliente e situação atual.

### Contrato de saída

A resposta contém:

- `status`: indica sucesso ou erro;
- `summary.total_ativos`: quantidade de clientes ativos processados;
- `summary.risco_alto`: quantidade de clientes com `score_risco > 60`;
- `data`: lista ordenada de análises de clientes.

Cada item de `data` contém `cliente_id`, `porte`, `plano`, `valor_mensal`, `score_risco`, `urgencia_fila`, `evidencias`, `palavras_chave` e `acao_recomendada`.

### Estratégia de IA e tolerância a falhas

O backend transforma os dados tabulares em contexto textual e envia esse contexto ao modelo `gemini-1.5-flash`. O prompt define:

1. os sinais de risco que devem ser observados;
2. os critérios e prioridades fornecidos pelo usuário;
3. o formato JSON obrigatório da resposta;
4. a ordenação por `urgencia_fila`.

Se a chave estiver ausente, for inválida, houver indisponibilidade do modelo ou o retorno não for um JSON válido, o `ChurnAnalyzer` gera uma análise local de contingência com os dados da própria planilha. Assim, a interface continua recebendo um contrato válido durante uma demonstração ou indisponibilidade temporária do serviço externo.

### Complexidade e custo computacional

Considere:

- `C`: número de clientes ativos;
- `A`: número de registros de atendimento;
- `N`: número de registros de NPS.

O carregamento das planilhas é linear em relação ao tamanho dos arquivos. Para cada cliente ativo, o código filtra os DataFrames de atendimento, NPS e cadastro. Na implementação atual, essa etapa tem custo aproximado de `O(C * (A + N + C))`, pois os filtros percorrem os DataFrames para cada cliente.

O custo do fallback é `O(C log C)` por causa da ordenação final. O custo da chamada ao Gemini depende do tamanho do contexto enviado, do tempo de resposta da API e dos limites do provedor.

Para bases maiores, a principal evolução técnica é indexar os DataFrames por `cliente_id` ou pré-agrupar os registros antes do loop, reduzindo o custo dos filtros repetidos.

### Limites atuais

- O resultado depende da qualidade e da estrutura da planilha de entrada.
- A análise do Gemini não substitui validação humana para decisões comerciais sensíveis.
- A chave da API deve ser configurada por variável de ambiente e nunca deve ser versionada.
- O CORS está aberto para facilitar a integração durante o hackathon; em produção, deve ser restringido aos domínios autorizados.
- Não há autenticação, persistência de resultados ou histórico de análises na versão atual.

### Evolução recomendada

1. Validar o schema da planilha antes do processamento.
2. Substituir filtros repetidos por agrupamentos indexados.
3. Registrar prompts, versão do modelo e resultado para auditoria.
4. Adicionar autenticação e restringir o CORS.
5. Persistir análises para acompanhar a evolução do risco por cliente.
6. Criar testes automatizados para o endpoint e para o fallback.