import sqlite3
import pandas as pd

conn = sqlite3.connect('inova.db')

# Lendo todas as tabelas
df_clientes = pd.read_sql_query('SELECT * FROM clientes', conn)
df_atendimentos = pd.read_sql_query('SELECT * FROM atendimento_mensal', conn)
df_nps = pd.read_sql_query('SELECT * FROM pesquisas_nps', conn)
df_situacao = pd.read_sql_query('SELECT * FROM situacao_clientes', conn)

conn.close()

# Salvando no Excel
with pd.ExcelWriter('base_hackathon.xlsx') as writer:
    df_clientes.to_excel(writer, sheet_name='clientes', index=False)
    df_atendimentos.to_excel(writer, sheet_name='atendimento_mensal', index=False)
    df_nps.to_excel(writer, sheet_name='pesquisas_nps', index=False)
    df_situacao.to_excel(writer, sheet_name='situacao_clientes', index=False)

print("Exportado com sucesso para base_hackathon.xlsx")
