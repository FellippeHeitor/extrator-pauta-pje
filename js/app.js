/**
 * Aplicação principal - Extrator de Processos PJe TJMG
 */

class PautaExtractorApp {
  constructor() {
    this.pdfExtractor = new PDFExtractor();
    this.csvExporter = new CSVExporter();
    this.selectedFile = null;
    this.selectedDigits = this.loadSelectedDigits(); // Carrega do localStorage
    this.selectedProcessType = "criminal"; // Padrão: apenas criminal
    this.extractedData = [];
    this.isProcessing = false;

    this.initializeEventListeners();
    this.updateDigitsDisplay();
    this.applyStoredDigitSelection(); // Aplica seleção salva na UI
  }

  /**
   * Inicializa os event listeners
   */
  initializeEventListeners() {
    // Input de arquivo
    const fileInput = document.getElementById("file-input");
    fileInput.addEventListener("change", (e) => this.handleFileSelect(e));

    // Botões de dígitos
    const digitButtons = document.querySelectorAll(".digit-btn");
    digitButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.toggleDigit(e));
    });

    // Controles de dígitos
    document
      .getElementById("select-all-digits")
      .addEventListener("click", () => this.selectAllDigits());
    document
      .getElementById("select-none-digits")
      .addEventListener("click", () => this.selectNoneDigits());

    // Filtro de tipo de processo
    const processTypeInputs = document.querySelectorAll(
      'input[name="process-type"]'
    );
    processTypeInputs.forEach((input) => {
      input.addEventListener("change", (e) => this.handleProcessTypeChange(e));
    });

    // Botão de processar
    document
      .getElementById("process-btn")
      .addEventListener("click", () => this.processFile());

    // Botões de exportação
    document
      .getElementById("copy-clipboard-btn")
      .addEventListener("click", () => this.copyToClipboard());
    document
      .getElementById("create-sheets-btn")
      .addEventListener("click", () => this.createGoogleSheets());
    document
      .getElementById("download-csv-btn")
      .addEventListener("click", () => this.downloadCSV());

    // Modal de resultados
    document
      .getElementById("close-results-modal")
      .addEventListener("click", () => this.closeResultsModal());
    
    // Fechar modal clicando no overlay
    document
      .getElementById("results-modal")
      .addEventListener("click", (e) => {
        if (e.target.id === "results-modal") {
          this.closeResultsModal();
        }
      });

    // Fechar modal com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("results-modal").style.display === "flex") {
        this.closeResultsModal();
      }
    });

    // Drag and drop
    this.setupDragAndDrop();
  }

  /**
   * Configura drag and drop para arquivos
   */
  setupDragAndDrop() {
    const container = document.querySelector(".file-input-container");

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      container.addEventListener(eventName, this.preventDefaults, false);
      document.body.addEventListener(eventName, this.preventDefaults, false);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      container.addEventListener(
        eventName,
        () => container.classList.add("drag-over"),
        false
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      container.addEventListener(
        eventName,
        () => container.classList.remove("drag-over"),
        false
      );
    });

    container.addEventListener("drop", (e) => this.handleDrop(e), false);
  }

  /**
   * Previne comportamentos padrão do drag and drop
   */
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Manipula o drop de arquivos
   */
  handleDrop(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        this.setSelectedFile(file);
      } else {
        this.showError("Por favor, selecione apenas arquivos PDF.");
      }
    }
  }

  /**
   * Manipula a seleção de arquivo
   */
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        this.setSelectedFile(file);
      } else {
        this.showError("Por favor, selecione apenas arquivos PDF.");
        event.target.value = "";
      }
    }
  }

  /**
   * Define o arquivo selecionado
   */
  setSelectedFile(file) {
    this.selectedFile = file;

    // Atualiza informações do arquivo
    document.getElementById("file-name").textContent = file.name;
    document.getElementById("file-size").textContent = this.formatFileSize(
      file.size
    );
    document.getElementById("file-info").style.display = "flex";

    // Mostra seção de dígitos
    document.getElementById("digits-section").style.display = "block";

    // Esconde seções de resultado e erro
    this.hideResults();
    this.hideError();
  }

  /**
   * Formata tamanho do arquivo
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Alterna seleção de dígito
   */
  toggleDigit(event) {
    const digit = parseInt(event.target.dataset.digit);
    const button = event.target;

    if (this.selectedDigits.includes(digit)) {
      this.selectedDigits = this.selectedDigits.filter((d) => d !== digit);
      button.classList.remove("selected");
    } else {
      this.selectedDigits.push(digit);
      button.classList.add("selected");
    }

    this.updateDigitsDisplay();
    this.saveSelectedDigits(); // Salva no localStorage
  }

  /**
   * Seleciona todos os dígitos
   */
  selectAllDigits() {
    this.selectedDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    document.querySelectorAll(".digit-btn").forEach((btn) => {
      btn.classList.add("selected");
    });
    this.updateDigitsDisplay();
    this.saveSelectedDigits(); // Salva no localStorage
  }

  /**
   * Deseleciona todos os dígitos
   */
  selectNoneDigits() {
    this.selectedDigits = [];
    document.querySelectorAll(".digit-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });
    this.updateDigitsDisplay();
    this.saveSelectedDigits(); // Salva no localStorage
  }

  /**
   * Atualiza a exibição dos dígitos selecionados
   */
  updateDigitsDisplay() {
    const processBtn = document.getElementById("process-btn");
    processBtn.disabled = this.selectedDigits.length === 0;
  }

  /**
   * Processa o arquivo PDF
   */
  async processFile() {
    if (!this.selectedFile) {
      this.showError("Nenhum arquivo selecionado.");
      return;
    }

    if (this.selectedDigits.length === 0) {
      this.showError("Selecione pelo menos um dígito para filtragem.");
      return;
    }

    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.showProgress();
    this.hideError();
    this.hideResults();

    try {
      const result = await this.pdfExtractor.extractFromPDF(
        this.selectedFile,
        this.selectedDigits,
        this.selectedProcessType,
        (progress) => this.updateProgress(progress)
      );

      if (result.success) {
        this.extractedData = result.data;
        this.showResults(result);
      } else {
        this.showError("Erro ao processar arquivo: " + result.error);
      }
    } catch (error) {
      console.error("Erro no processamento:", error);
      this.showError("Erro inesperado ao processar o arquivo.");
    } finally {
      this.isProcessing = false;
      this.hideProgress();
    }
  }

  /**
   * Atualiza a barra de progresso
   */
  updateProgress(progress) {
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");

    const percentage = Math.round((progress.page / progress.total) * 100);
    progressFill.style.width = percentage + "%";
    progressText.textContent = progress.text || `Processando... ${percentage}%`;
  }

  /**
   * Mostra seção de progresso
   */
  showProgress() {
    document.getElementById("progress-section").style.display = "block";
    document.getElementById("progress-fill").style.width = "0%";
    document.getElementById("progress-text").textContent =
      "Iniciando processamento...";
  }

  /**
   * Esconde seção de progresso
   */
  hideProgress() {
    document.getElementById("progress-section").style.display = "none";
  }

  /**
   * Mostra resultados da extração
   */
  showResults(result) {
    // Atualiza resumo
    document.getElementById("periodo-found").textContent =
      result.periodo || "Não encontrado";
    document.getElementById("total-found").textContent =
      result.total.toString();
    document.getElementById("digits-selected").textContent =
      this.selectedDigits.join(", ");

    // Atualiza tabela de preview
    this.updatePreviewTable(result.data);

    // Configura exportador CSV
    this.csvExporter.setData(result.data, {
      periodo: result.periodo,
      selectedDigits: this.selectedDigits,
      processType: this.selectedProcessType,
    });

    // Mostra modal de resultados
    document.getElementById("results-modal").style.display = "flex";
    
    // Previne scroll do body quando modal está aberto
    document.body.style.overflow = "hidden";
  }

  /**
   * Atualiza tabela de preview
   */
  updatePreviewTable(data) {
    const tbody = document.getElementById("preview-tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align: center; color: #666;">Nenhum processo encontrado</td></tr>';
      return;
    }

    // Mostra no máximo 100 linhas no preview
    const displayData = data.slice(0, 100);

    for (const item of displayData) {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${this.escapeHtml(item.processo)}</td>
                <td>${this.escapeHtml(item.tipo)}</td>
                <td>${this.escapeHtml(item.data)}</td>
                <td>${this.escapeHtml(item.hora)}</td>
            `;
      tbody.appendChild(row);
    }

    // Se há mais dados, mostra indicação
    if (data.length > 100) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="4" style="text-align: center; color: #666; font-style: italic;">... e mais ${
        data.length - 100
      } processos</td>`;
      tbody.appendChild(row);
    }
  }

  /**
   * Escapa HTML
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Esconde seção de resultados
   */
  hideResults() {
    document.getElementById("results-modal").style.display = "none";
    
    // Restaura scroll do body
    document.body.style.overflow = "auto";
  }

  /**
   * Copia dados para área de transferência
   */
  async copyToClipboard() {
    const result = await this.csvExporter.copyToClipboard();

    if (result.success) {
      this.showTemporaryMessage(
        "Dados copiados para a área de transferência!",
        "success"
      );
    } else {
      this.showError("Erro ao copiar dados: " + result.error);
    }
  }

  /**
   * Cria uma nova planilha no Google Sheets com os dados
   */
  async createGoogleSheets() {
    try {
      if (!this.extractedData || this.extractedData.length === 0) {
        this.showError("Nenhum dado disponível para criar a planilha.");
        return;
      }

      // Preparar dados formatados para Google Sheets
      const formattedData = this.prepareGoogleSheetsData();
      
      // Copiar dados formatados para área de transferência
      await this.copyFormattedDataToClipboard(formattedData);
      
      // Criar URL do Google Sheets para nova planilha
      const sheetsUrl = `https://docs.google.com/spreadsheets/create`;
      
      // Abrir Google Sheets em nova aba
      const newWindow = window.open(sheetsUrl, '_blank');
      
      // Mostrar instruções ao usuário
      this.showSheetsInstructions();
      
    } catch (error) {
      console.error("Erro ao criar Google Sheets:", error);
      this.showError("Erro ao abrir Google Sheets. Tente novamente.");
    }
  }

  /**
   * Mostra instruções para colar dados no Google Sheets
   */
  showSheetsInstructions() {
    const message = `
      ✅ Dados formatados copiados para área de transferência!
      
      📋 Como usar no Google Sheets:
      1. Uma nova aba foi aberta com o Google Sheets
      2. Clique na célula A1 da planilha
      3. Cole os dados (Ctrl+V ou Cmd+V)
      4. Os dados serão organizados automaticamente com formatação
    `;
    
    this.showTemporaryMessage(message, "success", 8000);
  }

  /**
   * Prepara dados formatados especificamente para Google Sheets
   */
  prepareGoogleSheetsData() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');
    
    // Metadados do cabeçalho
    const metadata = [
      [`PAUTA DE AUDIÊNCIAS PJE TJMG`],
      [`Extraído em: ${dateStr} às ${timeStr}`],
      [`Dígitos filtrados: ${this.selectedDigits.join(', ')}`],
      [`Tipo de processo: ${this.getProcessTypeLabel()}`],
      [`Total de processos: ${this.extractedData.length}`],
      [`Período: ${document.getElementById('periodo-found').textContent}`],
      [], // Linha em branco
      [`PROCESSO`, `TIPO`, `DATA`, `HORA`] // Cabeçalhos das colunas
    ];

    // Dados dos processos
    const processData = this.extractedData.map(item => [
      item.processo,
      item.tipo,
      item.data,
      item.hora
    ]);

    // Combinar metadados e dados
    return [...metadata, ...processData];
  }

  /**
   * Copia dados formatados para área de transferência usando formato de tabela
   */
  async copyFormattedDataToClipboard(data) {
    try {
      // Converter para formato TSV (Tab Separated Values) que o Google Sheets reconhece melhor
      const tsvContent = data.map(row => 
        row.map(cell => String(cell || '')).join('\t')
      ).join('\n');

      // Usar clipboard API se disponível
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tsvContent);
        return { success: true };
      } else {
        // Fallback para métodos antigos
        const textArea = document.createElement('textarea');
        textArea.value = tsvContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return { success: true };
      }
    } catch (error) {
      console.error('Erro ao copiar dados formatados:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retorna o label do tipo de processo selecionado
   */
  getProcessTypeLabel() {
    switch (this.selectedProcessType) {
      case 'criminal':
        return 'Criminal';
      case 'civil':
        return 'Cível';
      case 'both':
        return 'Criminal e Cível';
      default:
        return 'Criminal';
    }
  }

  /**
   * Faz download do arquivo CSV
   */
  downloadCSV() {
    const filename = this.generateFilename();
    const result = this.csvExporter.downloadCSV(filename);

    if (result.success) {
      this.showTemporaryMessage(
        `Arquivo ${result.filename} baixado com sucesso!`,
        "success"
      );
    } else {
      this.showError("Erro ao baixar arquivo: " + result.error);
    }
  }

  /**
   * Gera nome do arquivo baseado na data
   */
  generateFilename() {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    return `pauta-audiencias-pje-${dateStr}-${timeStr}.csv`;
  }

  /**
   * Mostra mensagem de erro
   */
  showError(message) {
    document.getElementById("error-text").textContent = message;
    document.getElementById("error-section").style.display = "block";
  }

  /**
   * Esconde seção de erro
   */
  hideError() {
    document.getElementById("error-section").style.display = "none";
  }

  /**
   * Mostra mensagem temporária
   */
  showTemporaryMessage(message, type = "info", duration = 3000) {
    // Remove mensagens anteriores
    const existingMessages = document.querySelectorAll(".temp-message");
    existingMessages.forEach((msg) => msg.remove());

    // Cria nova mensagem
    const messageDiv = document.createElement("div");
    messageDiv.className = `temp-message temp-message-${type}`;
    
    // Se a mensagem contém quebras de linha, usar innerHTML preservando a estrutura
    if (message.includes('\n')) {
      messageDiv.innerHTML = message.replace(/\n/g, '<br>');
    } else {
      messageDiv.textContent = message;
    }
    
    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#4CAF50" : "#2196F3"};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 500;
            font-size: 14px;
            line-height: 1.4;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
            white-space: pre-line;
        `;

    document.body.appendChild(messageDiv);

    // Remove após o tempo especificado
    setTimeout(() => {
      messageDiv.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => messageDiv.remove(), 300);
    }, duration);
  }

  /**
   * Carrega os dígitos selecionados do localStorage
   */
  loadSelectedDigits() {
    try {
      const storedDigits = localStorage.getItem(
        "pauta-extractor-selected-digits"
      );
      if (storedDigits) {
        const digits = JSON.parse(storedDigits);
        // Valida se é um array válido de números entre 0-9
        if (
          Array.isArray(digits) &&
          digits.every((d) => Number.isInteger(d) && d >= 0 && d <= 9)
        ) {
          return digits;
        }
      }
    } catch (error) {
      console.warn("Erro ao carregar dígitos do localStorage:", error);
    }

    // Retorna dígitos padrão se não houver dados válidos
    return [2, 3];
  }

  /**
   * Salva os dígitos selecionados no localStorage
   */
  saveSelectedDigits() {
    try {
      localStorage.setItem(
        "pauta-extractor-selected-digits",
        JSON.stringify(this.selectedDigits)
      );
    } catch (error) {
      console.warn("Erro ao salvar dígitos no localStorage:", error);
    }
  }

  /**
   * Aplica a seleção de dígitos salva na interface
   */
  applyStoredDigitSelection() {
    document.querySelectorAll(".digit-btn").forEach((btn) => {
      const digit = parseInt(btn.dataset.digit);
      if (this.selectedDigits.includes(digit)) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });
  }

  /**
   * Manipula mudança no tipo de processo
   */
  handleProcessTypeChange(event) {
    this.selectedProcessType = event.target.value;
    console.log("Tipo de processo selecionado:", this.selectedProcessType);
  }

  /**
   * Fecha o modal de resultados
   */
  closeResultsModal() {
    document.getElementById("results-modal").style.display = "none";
    
    // Restaura scroll do body
    document.body.style.overflow = "auto";
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  // Inicializa aplicação
  window.app = new PautaExtractorApp();

  console.log("Extrator de Processos PJe TJMG inicializado com sucesso!");
});
