# 📋 Extrator de Processos - Pauta PJe TJMG

<div align="center">

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![QB64](https://img.shields.io/badge/origem-QB64-orange.svg)

**Uma aplicação web moderna para extrair dados de processos criminais das pautas de audiências do PJe TJMG**

[🚀 Demo Online](#-demo) • [📖 Documentação](#-características) • [💻 Instalação](#️-instalação) • [🤝 Contribuir](#-contribuindo)

</div>

---

## 🎯 Sobre o Projeto

O **Extrator de Processos PJe TJMG** é uma ferramenta especializada para extrair e organizar dados de processos criminais das pautas de audiências do Processo Judicial Eletrônico (PJe) do Tribunal de Justiça de Minas Gerais.

### 📜 História

Este projeto teve sua **origem em QB64** como uma aplicação desktop que utilizava LibreOffice para converter PDFs. A versão atual representa uma **evolução completa** para tecnologias web modernas, oferecendo:

- ✅ **Independência de software externo** (não precisa mais do LibreOffice)
- ✅ **Interface web moderna e responsiva**
- ✅ **Processamento direto de PDF no navegador**
- ✅ **Multiplataforma** (funciona em qualquer dispositivo com navegador)

---

## ⭐ Características

### 🔧 Funcionalidades Principais

- **📄 Leitura Direta de PDF**: Processa arquivos PDF sem necessidade de conversão
- **🎯 Filtragem Inteligente**: Selecione processos pelo 7º dígito do número CNJ
- **⚡ Processamento em Tempo Real**: Veja o progresso da extração
- **📊 Preview dos Dados**: Visualize os resultados antes de exportar
- **💾 Múltiplas Exportações**: Copie para área de transferência ou baixe CSV
- **🔄 Drag & Drop**: Arraste arquivos diretamente para a interface
- **💾 Memória Persistente**: Salva automaticamente suas preferências de filtro

### 🎨 Interface Moderna

- **Responsive Design**: Funciona perfeitamente em desktop, tablet e mobile
- **Feedback Visual**: Indicadores de progresso e status em tempo real
- **UX Intuitiva**: Interface limpa e fácil de usar
- **Temas Profissionais**: Design moderno com gradientes e animações suaves

---

## 🚀 Demo

### Versão Web (Atual)
Abra o arquivo `index.html` em qualquer navegador moderno ou hospede em um servidor web.

### Versão Original (QB64)
A versão original em QB64 está disponível em `bas/extractprocess_pauta.bas` para referência histórica.

---

## 🛠️ Instalação

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Suporte a JavaScript ES6+

### Uso Local
```bash
# Clone o repositório
git clone https://github.com/fellippeheitor/extrator-pauta-pje.git

# Navegue até o diretório
cd extrator-pauta-pje

# Abra o arquivo index.html no seu navegador
# Ou use um servidor local
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Hospedagem Web
Faça upload de todos os arquivos para seu servidor web. A aplicação é totalmente client-side e não requer backend.

---

## 📖 Como Usar

### 1. **Selecionar Arquivo**
- Clique em "Selecionar arquivo PDF" ou arraste um arquivo PDF da pauta PJe
- Apenas arquivos PDF são aceitos

### 2. **Configurar Filtros**
- Selecione os dígitos da 7ª posição dos processos que deseja extrair
- Por padrão, os dígitos 2 e 3 estão selecionados
- Use "Todos" ou "Limpar" para facilitar a seleção

### 3. **Processar**
- Clique em "Processar Arquivo"
- Acompanhe o progresso em tempo real

### 4. **Exportar Resultados**
- **Copiar**: Copia dados em formato CSV para área de transferência
- **Baixar**: Salva arquivo CSV com timestamp

---

## 📊 Formato dos Dados

### Entrada
- **Arquivos PDF**: Pautas de audiências do PJe TJMG

### Saída (CSV)
```csv
Pauta de Audiências - PJe
Periodo de 01/07/2025 a 31/07/2025
Dígitos selecionados: [2,3]

Processo,Data,Hora
5002413-74.2024.8.13.0242,15/07/2025,14:00
1234567-89.2024.8.13.0123,16/07/2025,09:30
```

---

## 🏗️ Arquitetura

```
extrator-pauta-pje/
├── index.html              # Interface principal
├── demo.html               # Página de demonstração
├── css/
│   └── style.css           # Estilos da aplicação
├── js/
│   ├── app.js              # Aplicação principal
│   ├── pdf-extractor.js    # Lógica de extração de PDF
│   └── csv-exporter.js     # Geração de CSV
├── bas/
│   └── extractprocess_pauta.bas  # Versão original QB64
└── README.md
```

### Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **PDF Processing**: PDF.js (Mozilla)
- **UI/UX**: CSS Grid, Flexbox, Animações CSS
- **Storage**: localStorage para persistência de preferências

---

## 🔍 Comparação de Versões

| Característica | QB64 (Original) | Web (Atual) |
|---|---|---|
| **Plataforma** | Windows Desktop | Multiplataforma (Web) |
| **Dependências** | LibreOffice | Nenhuma |
| **Interface** | Console/Terminal | GUI Moderna |
| **Conversão PDF** | Externa (soffice) | Interna (PDF.js) |
| **Exportação** | Área de transferência | CSV + Área de transferência |
| **Portabilidade** | Limitada | Total |
| **Manutenção** | Complexa | Simples |

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/extrator-pauta-pje.git`
3. **Crie** uma branch: `git checkout -b minha-feature`
4. **Commit** suas mudanças: `git commit -m 'Adiciona nova feature'`
5. **Push** para a branch: `git push origin minha-feature`
6. **Abra** um Pull Request

### 🐛 Reportando Bugs
- Use as [Issues](https://github.com/fellippeheitor/extrator-pauta-pje/issues) para reportar bugs
- Inclua screenshots e informações do navegador
- Descreva os passos para reproduzir o problema

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Fellippe Heitor**

- 🌐 GitHub: [@fellippeheitor](https://github.com/fellippeheitor)
- 📧 Email: [fellippe.heitor@tjmg.jus.br]

---

## 📈 Changelog

### v2.0 (Web) - 2025
- ✨ Reescrita completa em tecnologias web
- ✨ Interface moderna e responsiva
- ✨ Processamento direto de PDF
- ✨ Múltiplas opções de exportação
- ✨ Persistência de configurações

### v1.0 (QB64) - Original
- 🎯 Versão inicial em QB64
- 🔄 Conversão via LibreOffice
- 📋 Extração básica para área de transferência

---

## 🙏 Agradecimentos

- **QB64 Community**: Pela linguagem que deu origem ao projeto
- **Mozilla PDF.js**: Pela excelente biblioteca de processamento de PDF
- **TJMG/CNJ**: Pelo sistema PJe que motivou a criação desta ferramenta

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

**Made with ❤️ by [Fellippe Heitor](https://github.com/fellippeheitor)**

</div>
