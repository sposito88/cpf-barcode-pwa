# Scanner de CPF → Código de Barras

Uma Progressive Web App (PWA) para escanear CPF em documentos usando a câmera do dispositivo e gerar códigos de barras.

## 🚀 Funcionalidades

- **Scanner de CPF**: Captura de imagem via câmera com foco automático
- **OCR Inteligente**: Reconhecimento de texto usando Tesseract.js
- **Validação de CPF**: Verificação automática dos dígitos verificadores
- **Geração de Códigos**: Criação de códigos de barras em diferentes formatos
- **PWA Completo**: Instalável como app nativo
- **Funcionamento Offline**: Cache inteligente de recursos

## 📱 Como Usar

1. **Acesse o app** no navegador
2. **Toque em "Ligar câmera"** para ativar a câmera
3. **Posicione o documento** na área destacada
4. **Toque em "Capturar & Ler CPF"** para processar
5. **Revise o CPF** detectado e corrija se necessário
6. **Toque em "Validar & Gerar Código"** para criar o código de barras
7. **Baixe o código** em formato PNG

## 🔧 Melhorias Implementadas

### 1. **Foco da Câmera**
- ✅ Configuração de foco automático contínuo
- ✅ Indicador visual de área de foco
- ✅ Toque na tela para reajustar foco
- ✅ Configurações otimizadas de resolução

### 2. **Reconhecimento de CPF**
- ✅ Algoritmo de extração melhorado
- ✅ Múltiplos padrões de reconhecimento
- ✅ Filtros de imagem para melhor OCR
- ✅ Priorização de CPFs válidos
- ✅ Feedback visual detalhado

### 3. **Instalação PWA**
- ✅ Prompt de instalação automático
- ✅ Manifest otimizado para instalação
- ✅ Ícones com propósito maskable
- ✅ Configurações de orientação e categoria

### 4. **Melhorias Gerais**
- ✅ Interface mais responsiva
- ✅ Mensagens de status detalhadas
- ✅ Melhor tratamento de erros
- ✅ Cache inteligente no Service Worker
- ✅ Funcionamento offline aprimorado

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **OCR**: Tesseract.js 4.1.1
- **Códigos de Barras**: JsBarcode 3.11.6
- **PWA**: Service Worker, Web App Manifest
- **Câmera**: MediaDevices API

## 📋 Requisitos

- Navegador moderno com suporte a:
  - MediaDevices API
  - Service Workers
  - Web App Manifest
  - Canvas API
- Câmera traseira (recomendado)
- Boa iluminação para melhor OCR

## 🚀 Instalação

1. Clone o repositório
2. Sirva os arquivos via HTTP/HTTPS
3. Acesse no navegador
4. Instale como PWA quando solicitado

## 📝 Notas Técnicas

### Algoritmo de Reconhecimento de CPF

O app utiliza múltiplas estratégias para detectar CPFs:

1. **Padrões formatados**: `123.456.789-01`
2. **Padrões sem formatação**: `12345678901`
3. **Busca por sequências**: 11 dígitos consecutivos
4. **Limpeza de caracteres**: Substituição de O→0, l→1, etc.

### Cache Strategy

- **Recursos locais**: Cache-first
- **Recursos externos**: Stale-while-revalidate
- **Dados Tesseract**: Cache em background

## 🔒 Privacidade

- ✅ Todo processamento local
- ✅ Nenhum dado enviado a servidores
- ✅ Imagens não são armazenadas
- ✅ Funcionamento offline completo

## 📞 Suporte

Para problemas ou sugestões, abra uma issue no repositório.

---

**Versão**: 2.0  
**Última atualização**: Dezembro 2024 