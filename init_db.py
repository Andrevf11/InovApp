import sqlite3
import os

db_path = 'inova.db'
sql_path = 'inova.sql'

if os.path.exists(sql_path):
    print(f"Lendo o arquivo {sql_path} e criando o banco de dados local SQLite...")
    try:
        with open(sql_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        conn = sqlite3.connect(db_path)
        conn.executescript(sql_script)
        conn.close()
        print("Banco de dados inova.db criado com sucesso!")
    except Exception as e:
        print(f"Erro ao processar SQL: {e}")
else:
    print(f"Arquivo {sql_path} não encontrado!")
