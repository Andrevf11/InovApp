from logic import ChurnAnalyzer
import collections

with open('base_hackathon.xlsx', 'rb') as f:
    file_bytes = f.read()

analyzer = ChurnAnalyzer()
fila = analyzer.processar_ativos(file_bytes, '', '', '')
portes = [c.get('porte', 'None') for c in fila]
print(collections.Counter(portes))
