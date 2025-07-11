/**
 * Módulo para extração de dados de PDFs de pautas de audiências do PJe TJMG
 */

class PDFExtractor {
  constructor() {
    this.currentPDF = null;
    this.extractedData = [];
    this.periodo = "";
    this.onProgress = null;
  }

  /**
   * Processa um arquivo PDF e extrai os dados dos processos
   */
  async extractFromPDF(file, selectedDigits, onProgress = null) {
    this.onProgress = onProgress;
    this.extractedData = [];
    this.periodo = "";

    try {
      // Carrega o PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      const totalPages = pdf.numPages;
      let allTextItems = [];

      // Extrai texto de todas as páginas
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        if (this.onProgress) {
          this.onProgress({
            page: pageNum,
            total: totalPages,
            text: `Processando página ${pageNum} de ${totalPages}...`,
          });
        }

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Adiciona cada item de texto individualmente ao array
        allTextItems.push(...textContent.items.map((item) => item.str));
      }

      // Processa o texto extraído
      await this.processExtractedText(allTextItems, selectedDigits);

      return {
        success: true,
        data: this.extractedData,
        periodo: this.periodo,
        total: this.extractedData.length,
      };
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Processa o texto extraído do PDF
   */
  async processExtractedText(textItems, selectedDigits) {
    let currentDate = "";
    let currentTime = "";
    let currentProcess = "";
    let processoCriminal = false;

    // Regex patterns
    const datePattern = /(\d{2}\/\d{2}\/\d{4})/;
    const timePattern = /(\d{2}:\d{2})/g;
    const processPattern = /(\d{7}-\d{2}\.\d{4}\.8\.13\.\d{4})/g;

    const totalItems = textItems.length;

    for (let i = 0; i < textItems.length; i++) {
      const item = textItems[i].trim();

      // Atualiza progresso a cada 100 itens ou no final
      if (this.onProgress && (i % 100 === 0 || i === totalItems - 1)) {
        const percentage = Math.round((i / totalItems) * 100);
        this.onProgress({
          page: i + 1,
          total: totalItems,
          text: `Analisando texto... ${percentage}% (${i + 1}/${totalItems})`
        });
        
        // Pequena pausa para permitir atualização da UI
        if (i % 500 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      if (!item) continue;

      // Extrai o período
      if (item.includes('Período')) {
        this.periodo = "Período";
      }

      // Extrai data
      const dateMatch = item.match(datePattern);
      if (dateMatch) {
        currentDate = dateMatch[1];
        if (this.periodo === "Período") {
          this.periodo = currentDate + " a ";
        } else if (this.periodo.slice(-3) === " a ") {
          this.periodo += currentDate;
        }
        continue;
    }

      // Extrai horário
      const timeMatches = item.match(timePattern);
      if (timeMatches) {
        // Pega o primeiro horário válido (entre 08:00 e 23:59)
        for (const timeMatch of timeMatches) {
          const [hours, minutes] = timeMatch.split(":").map(Number);
          if (hours >= 8 && hours <= 23) {
            currentTime = timeMatch;
            processoCriminal = false;
            currentProcess = "";
            break;
          }
        }
      }

      // Verifica se é processo criminal
      if (item.includes("CRIMINAL]")) {
        processoCriminal = true;
      } else if (item.includes("CÍVEL]")) {
        processoCriminal = false;
        currentProcess = "";
      }

      // Extrai número do processo
      const processMatches = item.match(processPattern);
      if (processMatches) {
        for (const processMatch of processMatches) {
          const process = processMatch.trim();

          // Verifica o 7º dígito do processo
          if (process.length >= 7) {
            const seventhDigit = parseInt(process.charAt(6));

            if (selectedDigits.includes(seventhDigit)) {
              currentProcess = process;
            }
          }
        }
      }

      // Se é criminal e temos todos os dados, adiciona à lista
      if (
        processoCriminal === true &&
        currentDate !== "" &&
        currentTime !== "" &&
        currentProcess !== ""
      ) {
        this.extractedData.push({
          processo: currentProcess,
          data: currentDate,
          hora: currentTime,
        });

        // Reset para próximo processo
        currentProcess = "";
        processoCriminal = false;
      }
    }

    // Atualização final do progresso
    if (this.onProgress) {
      this.onProgress({
        page: totalItems,
        total: totalItems,
        text: `Análise concluída! Encontrados ${this.extractedData.length} processos.`
      });
    }
  }

  /**
   * Valida se um número de processo está no formato correto do CNJ
   */
  isValidProcessNumber(processNumber) {
    // Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
    const pattern = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
    return pattern.test(processNumber);
  }

  /**
   * Extrai o dígito verificador de um processo
   */
  getProcessSeventhDigit(processNumber) {
    if (processNumber.length >= 7) {
      return parseInt(processNumber.charAt(6));
    }
    return -1;
  }

  /**
   * Formata a data no padrão brasileiro
   */
  formatDate(dateStr) {
    // Se já estiver no formato DD/MM/YYYY, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
    }

    // Tenta outros formatos comuns
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("pt-BR");
    }

    return dateStr;
  }

  /**
   * Formata horário no padrão HH:MM
   */
  formatTime(timeStr) {
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }

    // Remove segundos se existirem
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr.substring(0, 5);
    }

    return timeStr;
  }

  /**
   * Retorna estatísticas dos dados extraídos
   */
  getStatistics() {
    return {
      total: this.extractedData.length,
      periodo: this.periodo,
      firstDate:
        this.extractedData.length > 0 ? this.extractedData[0].data : null,
      lastDate:
        this.extractedData.length > 0
          ? this.extractedData[this.extractedData.length - 1].data
          : null,
    };
  }
}

// Exporta a classe para uso global
window.PDFExtractor = PDFExtractor;
