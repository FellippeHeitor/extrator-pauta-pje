/**
 * Módulo para exportação de dados em formato CSV
 */

class CSVExporter {
    constructor() {
        this.data = [];
        this.headers = [];
        this.metadata = {};
    }

    /**
     * Define os dados a serem exportados
     */
    setData(data, metadata = {}) {
        this.data = data;
        this.metadata = metadata;
        this.headers = ['Processo', 'Tipo', 'Data', 'Hora'];
    }

    /**
     * Gera o conteúdo CSV completo com cabeçalho
     */
    generateCSV() {
        let csvContent = '';
        
        // Adiciona metadados como comentários
        csvContent += this.generateHeader();
        
        // Adiciona cabeçalho das colunas
        csvContent += this.headers.join(',') + '\n';
        
        // Adiciona dados
        for (const row of this.data) {
            const csvRow = [
                this.escapeCSV(row.processo),
                this.escapeCSV(row.tipo),
                this.escapeCSV(row.data),
                this.escapeCSV(row.hora)
            ];
            csvContent += csvRow.join(',') + '\n';
        }
        
        return csvContent;
    }

    /**
     * Gera o cabeçalho do CSV com metadados
     */
    generateHeader() {
        let header = '';
        
        header += 'Pauta de Audiências - PJe\n';
        
        if (this.metadata.periodo) {
            header += `Periodo de ${this.metadata.periodo}\n`;
        }
        
        if (this.metadata.selectedDigits && this.metadata.selectedDigits.length > 0) {
            header += `Dígitos selecionados: [${this.metadata.selectedDigits.join(',')}]\n`;
        }

        if (this.metadata.processType) {
            const typeText = this.metadata.processType === 'both' ? 'Criminal e Cível' :
                           this.metadata.processType === 'criminal' ? 'Criminal' : 'Cível';
            header += `Tipo de processo: ${typeText}\n`;
        }
        
        header += '\n'; // Linha em branco antes dos dados
        
        return header;
    }

    /**
     * Escapa caracteres especiais para CSV
     */
    escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const stringValue = String(value);
        
        // Se contém vírgula, aspas ou quebra de linha, envolve em aspas
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        
        return stringValue;
    }

    /**
     * Copia o CSV para a área de transferência
     */
    async copyToClipboard() {
        const csvContent = this.generateCSV();
        
        try {
            await navigator.clipboard.writeText(csvContent);
            return { success: true };
        } catch (error) {
            console.error('Erro ao copiar para área de transferência:', error);
            
            // Fallback para navegadores mais antigos
            try {
                const textArea = document.createElement('textarea');
                textArea.value = csvContent;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                return { success: true };
            } catch (fallbackError) {
                return { 
                    success: false, 
                    error: 'Não foi possível copiar para a área de transferência' 
                };
            }
        }
    }

    /**
     * Faz download do arquivo CSV
     */
    downloadCSV(filename = null) {
        const csvContent = this.generateCSV();
        
        // Gera nome do arquivo se não fornecido
        if (!filename) {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
            filename = `pauta-audiencias-pje-${dateStr}.csv`;
        }
        
        try {
            // Cria blob com BOM para UTF-8 (para Excel reconhecer acentos)
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { 
                type: 'text/csv;charset=utf-8;' 
            });
            
            // Cria link de download
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpa o URL do objeto
            URL.revokeObjectURL(url);
            
            return { success: true, filename };
            
        } catch (error) {
            console.error('Erro ao fazer download do CSV:', error);
            return { 
                success: false, 
                error: 'Não foi possível fazer o download do arquivo' 
            };
        }
    }


}

// Exporta a classe para uso global
window.CSVExporter = CSVExporter;
