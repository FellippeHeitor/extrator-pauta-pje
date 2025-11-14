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
  async extractFromPDF(file, selectedDigits, processType = 'criminal', onProgress = null) {
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
      await this.processExtractedText(allTextItems, selectedDigits, processType);

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
  async processExtractedText(textItems, selectedDigits, processType) {
    let settingDate = false;
    let currentDate = "";
    let currentTime = "";
    let currentProcess = "";
    let currentProcessType = "";

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

      if (item.includes('Data:')) {
        settingDate = true;
        continue;
      }
      
      // Extrai data
      const dateMatch = item.match(datePattern);
      if (dateMatch) {
        if (settingDate) {
          currentDate = dateMatch[1];
          settingDate = false;
        }

        if (this.periodo === "Período") {
          this.periodo = dateMatch[1] + " a ";
        } else if (this.periodo.slice(-3) === " a ") {
          this.periodo += dateMatch[1];
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
            currentProcessType = "";
            currentProcess = "";
            break;
          }
        }
      }

      // Verifica se é processo criminal ou cível
      if (item.includes("CRIMINAL]") || item.includes("INFRACIONAL]")) {
        currentProcessType = "Criminal";
      } else if (item.includes("CÍVEL]")) {
        currentProcessType = "Cível";
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

      // Verifica se deve incluir o processo baseado no filtro de tipo
      const shouldInclude = this.shouldIncludeProcess(currentProcessType, processType);

      // Se temos todos os dados e deve incluir, adiciona à lista
      if (
        shouldInclude &&
        currentDate !== "" &&
        currentTime !== "" &&
        currentProcess !== "" &&
        currentProcessType !== ""
      ) {
        this.extractedData.push({
          processo: currentProcess,
          tipo: currentProcessType,
          data: currentDate,
          hora: currentTime,
        });

        // Reset para próximo processo
        currentProcess = "";
        currentProcessType = "";
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
   * Verifica se o processo deve ser incluído baseado no filtro de tipo
   */
  shouldIncludeProcess(currentProcessType, filterType) {
    if (filterType === 'both') {
      return currentProcessType === 'Criminal' || currentProcessType === 'Cível';
    } else if (filterType === 'criminal') {
      return currentProcessType === 'Criminal';
    } else if (filterType === 'civil') {
      return currentProcessType === 'Cível';
    }
    return false;
  }


}

// Exporta a classe para uso global
window.PDFExtractor = PDFExtractor;
