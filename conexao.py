import pyodbc

servidor = r'localhost'
database = 'GlobalSys'

conexao = pyodbc.connect(
    f'DRIVER={{ODBC Driver 17 for SQL Server}};'
    f'SERVER={"TARSYLLADEV\SQLEXPRESS"};'
    f'DATABASE={"Globalsys"};'
    'Trusted_Connection=yes;'
)

cursor = conexao.cursor()

print("Conexão com o banco realizada com sucesso!")