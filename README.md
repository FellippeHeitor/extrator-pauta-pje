# Extrator de Processos - Pauta de Audiências PJe TJMG

Uma aplicação web moderna para extrair dados de processos criminais das pautas de audiências do PJe (Processo Judicial Eletrônico) do TJMG.

## 🚀 Características

- ✅ **Sem dependências externas**: Não precisa do LibreOffice ou outros conversores
- ✅ **Leitura direta de PDF**: Usa PDF.js para processar arquivos PDF no navegador
- ✅ **Interface moderna**: Design responsivo e intuitivo
- ✅ **Filtragem por dígitos**: Selecione quais dígitos do processo deseja filtrar
- ✅ **Preview em tempo real**: Visualize os dados antes de exportar
- ✅ **Múltiplas opções de exportação**: Copiar para área de transferência ou baixar CSV
- ✅ **Suporte drag & drop**: Arraste arquivos diretamente para a interface

## 🖥️ Como Usar

### 1. Abrir a aplicação
- Abra o arquivo `index.html` em qualquer navegador moderno
- Ou sirva os arquivos através de um servidor web local

### 2. Selecionar arquivo PDF
- Clique em "Selecionar arquivo PDF" ou arraste o arquivo para a interface
- Apenas arquivos PDF de pautas do PJe TJMG são suportados

### 3. Configurar filtros
- Selecione os dígitos da 7ª posição do número do processo que deseja incluir
- Por padrão, os dígitos 2 e 3 estão selecionados
- Use "Selecionar Todos" ou "Desmarcar Todos" para facilitar a seleção

### 4. Processar arquivo
- Clique em "Processar Arquivo"
- Aguarde o processamento (uma barra de progresso será exibida)

### 5. Exportar resultados
- Visualize o preview dos dados extraídos
- **Copiar para Área de Transferência**: Copia os dados em formato CSV
- **Baixar CSV**: Faz download de um arquivo CSV com os dados

## 📋 Formato dos Dados

O arquivo CSV gerado contém:
- **Cabeçalho**: Informações sobre a pauta e filtros aplicados
- **Colunas**: Processo, Data, Hora
- **Dados**: Apenas processos criminais que atendem aos filtros

Exemplo:
```csv
Pauta de Audiências - PJe
Periodo de 01/07/2025 a 31/07/2025
Dígitos selecionados: [2,3]

Processo,Data,Hora
5002413-74.2024.8.13.0242,15/07/2025,14:30
5003627-85.2024.8.13.0242,15/07/2025,15:00
```

## 🔧 Requisitos Técnicos

- **Navegador**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **JavaScript**: Habilitado
- **Conexão**: Necessária apenas para carregar a biblioteca PDF.js (via CDN)

## 📂 Estrutura do Projeto

```
extrator-pauta-pje/
├── index.html              # Interface principal
├── css/
│   └── style.css           # Estilos da aplicação
├── js/
│   ├── app.js              # Lógica principal da aplicação
│   ├── pdf-extractor.js    # Módulo de extração de PDF
│   └── csv-exporter.js     # Módulo de exportação CSV
└── README.md               # Este arquivo
```

## 🆚 Diferenças da Versão QB64

| Recurso | QB64 Original | Versão Web |
|---------|---------------|------------|
| **Conversão PDF** | Requer LibreOffice | Leitura direta com PDF.js |
| **Interface** | Console/Desktop | Web responsiva |
| **Plataforma** | Windows apenas | Multiplataforma (qualquer navegador) |
| **Instalação** | Executável + LibreOffice | Apenas abrir HTML |
| **Exportação** | Área de transferência | CSV + Área de transferência |
| **Preview** | Limitado | Tabela interativa |

## 🔍 Como Funciona

1. **Carregamento do PDF**: A biblioteca PDF.js extrai o texto de todas as páginas
2. **Análise do texto**: Busca por padrões específicos:
   - Números de processo no formato CNJ (NNNNNNN-DD.AAAA.8.13.OOOO)
   - Datas no formato DD/MM/AAAA
   - Horários entre 08:00 e 23:59
   - Marcadores de processos criminais
3. **Filtragem**: Aplica o filtro de dígitos selecionados
4. **Formatação**: Organiza os dados e gera CSV com metadados

## 🐛 Solução de Problemas

### PDF não carrega
- Verifique se o arquivo não está corrompido
- Tente com outro navegador
- Verifique a conexão de internet (para carregar PDF.js)

### Nenhum processo encontrado
- Verifique se é um PDF de pauta do PJe TJMG
- Certifique-se de que há processos criminais no arquivo
- Ajuste os dígitos selecionados

### Erro ao copiar/baixar
- Alguns navegadores bloqueiam a área de transferência
- Tente fazer o download do CSV em vez de copiar
- Verifique as permissões do navegador

## 🔒 Privacidade

- **Processamento local**: Todos os dados são processados no seu navegador
- **Sem upload**: Nenhum arquivo é enviado para servidores externos
- **Sem armazenamento**: Os dados não são salvos permanentemente

## 📝 Licença

Este projeto é uma versão web do extrator original em QB64 para uso interno no TJMG.

## 🤝 Contribuições

Para melhorias ou correções, entre em contato com a equipe de desenvolvimento.

---

**Versão Web - Extrator de Processos PJe TJMG**  
*Desenvolvido para modernizar e facilitar a extração de dados de pautas de audiências*
