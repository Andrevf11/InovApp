document.addEventListener('DOMContentLoaded', () => {
    
    // Formulário de Conexão e Análise do Banco
    const analyzeDbForm = document.getElementById('analyzeDbForm');
    if(analyzeDbForm) {
        analyzeDbForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusDiv = document.getElementById('uploadStatus');

            statusDiv.innerHTML = '<span style="color:var(--text-muted)">Conectando ao SQL Server e analisando dados... Aguarde.</span>';

            try {
                const response = await fetch('/analyze_db', {
                    method: 'POST'
                });
                const data = await response.json();
                
                if(data.status === 'success') {
                    statusDiv.innerHTML = `<span class="success">✓ ${data.message}</span>`;
                    setTimeout(() => {
                        window.location.href = '/fila';
                    }, 1500);
                } else {
                    statusDiv.innerHTML = `<span class="error">✗ Erro: ${data.message}</span>`;
                }
            } catch (error) {
                statusDiv.innerHTML = `<span class="error">✗ Erro de conexão com o servidor.</span>`;
            }
        });
    }

});
