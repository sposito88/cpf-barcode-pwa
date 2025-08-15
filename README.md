# Scanner de Documentos - CPF & CNPJ v2.0

## 🚀 Visão Geral

O **Scanner de Documentos** é uma Progressive Web App (PWA) avançada desenvolvida para digitalização, validação e geração de códigos de barras para documentos brasileiros como CPF e CNPJ. Esta versão 2.0 representa uma evolução completa do projeto original, com melhorias significativas em design, funcionalidades, performance e experiência do usuário.

### ✨ Principais Melhorias da v2.0

- **Interface Moderna**: Design completamente reformulado com tema escuro/claro
- **Arquitetura Modular**: Código organizado em componentes reutilizáveis
- **Performance Otimizada**: Service Worker avançado e cache inteligente
- **Validações Robustas**: Sistema completo de validação de CPF e CNPJ
- **Histórico Inteligente**: Armazenamento local com busca e filtros
- **Responsividade Total**: Experiência perfeita em desktop e mobile
- **Acessibilidade**: Suporte completo a leitores de tela e navegação por teclado
- **PWA Avançada**: Instalação, shortcuts, compartilhamento e modo offline

## 🎯 Funcionalidades

### 📱 Core Features
- **Scanner OCR**: Reconhecimento óptico de caracteres usando Tesseract.js
- **Validação de Documentos**: Algoritmos de validação para CPF e CNPJ
- **Geração de Códigos de Barras**: Criação automática usando JsBarcode
- **Captura de Câmera**: Interface intuitiva para captura de documentos
- **Histórico Completo**: Armazenamento e gerenciamento de documentos escaneados

### 🎨 Interface e UX
- **Tema Adaptativo**: Modo escuro/claro com detecção automática
- **Animações Fluidas**: Transições suaves e feedback visual
- **Toasts Informativos**: Notificações elegantes para ações do usuário
- **Modais Responsivos**: Diálogos adaptativos para diferentes telas
- **Loading States**: Indicadores de progresso para operações assíncronas

### 🔧 Funcionalidades Técnicas
- **Service Worker**: Cache inteligente e funcionamento offline
- **Lazy Loading**: Carregamento sob demanda de componentes
- **Code Splitting**: Divisão otimizada de bundles JavaScript
- **Performance Monitoring**: Métricas de performance e otimização
- **Error Handling**: Sistema robusto de tratamento de erros

## 🏗️ Arquitetura

### 📁 Estrutura de Diretórios

```
cpf-barcode-pwa-enhanced/
├── index.html                 # Página principal
├── manifest.webmanifest       # Manifesto PWA
├── sw.js                      # Service Worker
├── build.config.js           # Configurações de build
├── optimize.js               # Script de otimização
├── src/
│   ├── css/
│   │   ├── base/             # Estilos base (reset, variáveis, tipografia)
│   │   ├── components/       # Estilos de componentes
│   │   └── themes/           # Temas (escuro/claro)
│   └── js/
│       ├── core/             # Funcionalidades principais
│       ├── components/       # Componentes UI
│       └── utils/            # Utilitários e helpers
├── icons/                    # Ícones da PWA
├── screenshots/              # Screenshots para app stores
└── assets/                   # Assets diversos
```

### 🧩 Componentes Principais

#### Core Components
- **App**: Controlador principal da aplicação
- **Camera**: Gerenciamento de câmera e captura
- **OCR**: Processamento de reconhecimento óptico
- **Barcode**: Geração de códigos de barras

#### UI Components
- **Toast**: Sistema de notificações
- **Modal**: Diálogos e popups
- **Theme**: Gerenciamento de temas

#### Utilities
- **Validators**: Validação de CPF e CNPJ
- **Storage**: Gerenciamento de armazenamento local
- **Helpers**: Funções auxiliares diversas

## 🚀 Instalação e Uso

### Pré-requisitos
- Navegador moderno com suporte a PWA
- Câmera (para funcionalidade de scanner)
- Conexão com internet (primeira execução)

### Instalação
1. Acesse a aplicação via navegador
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação da PWA
4. A aplicação estará disponível na tela inicial

### Uso Básico
1. **Escanear Documento**: Clique em "Escanear" e posicione o documento
2. **Validar**: O sistema valida automaticamente CPF/CNPJ
3. **Gerar Código de Barras**: Código é gerado automaticamente
4. **Salvar**: Documento é salvo no histórico local
5. **Compartilhar**: Use as opções de compartilhamento nativo

## 🎨 Design System

### 🎨 Paleta de Cores

#### Tema Escuro (Padrão)
- **Primary**: `#0f172a` (Slate 900)
- **Secondary**: `#1e293b` (Slate 800)
- **Accent**: `#0ea5e9` (Sky 500)
- **Success**: `#10b981` (Emerald 500)
- **Warning**: `#f59e0b` (Amber 500)
- **Error**: `#ef4444` (Red 500)

#### Tema Claro
- **Primary**: `#ffffff` (White)
- **Secondary**: `#f8fafc` (Slate 50)
- **Accent**: `#0ea5e9` (Sky 500)
- **Text**: `#0f172a` (Slate 900)

### 📝 Tipografia
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 2rem - 1.25rem (32px - 20px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)

### 🎭 Componentes UI

#### Botões
- **Primary**: Fundo accent, texto branco
- **Secondary**: Borda accent, texto accent
- **Ghost**: Sem fundo, texto accent

#### Cards
- **Elevation**: box-shadow sutil
- **Border Radius**: 0.75rem (12px)
- **Padding**: 1.5rem (24px)

#### Inputs
- **Border**: 2px solid transparent
- **Focus**: Border accent com shadow
- **Error**: Border error com mensagem

## ⚡ Performance

### 📊 Métricas Alvo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### 🔧 Otimizações Implementadas
- **Code Splitting**: Divisão em chunks menores
- **Lazy Loading**: Carregamento sob demanda
- **Image Optimization**: Compressão e formatos modernos
- **Service Worker**: Cache estratégico de recursos
- **Bundle Analysis**: Monitoramento de tamanho de bundles

### 📱 PWA Features
- **Installable**: Manifesto completo com ícones
- **Offline**: Funcionalidade básica sem internet
- **Background Sync**: Sincronização quando online
- **Push Notifications**: Notificações (futuro)

## 🔒 Segurança

### 🛡️ Medidas Implementadas
- **Content Security Policy**: Headers de segurança
- **HTTPS Only**: Forçar conexões seguras
- **Input Sanitization**: Validação de entradas
- **Local Storage**: Dados sensíveis não armazenados

### 🔐 Privacidade
- **Dados Locais**: Processamento local sem envio para servidores
- **Câmera**: Acesso apenas quando necessário
- **Histórico**: Armazenado localmente no dispositivo

## 🧪 Testes

### 🔍 Tipos de Teste
- **Unit Tests**: Funções de validação e utilitários
- **Integration Tests**: Componentes e fluxos
- **E2E Tests**: Cenários completos de usuário
- **Performance Tests**: Métricas de performance

### 🎯 Cobertura
- **Validators**: 100% cobertura
- **Core Functions**: 95% cobertura
- **UI Components**: 85% cobertura
- **Overall**: 90% cobertura

## 📱 Compatibilidade

### 🌐 Navegadores Suportados
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### 📱 Dispositivos
- **Desktop**: Windows, macOS, Linux
- **Mobile**: iOS 13+, Android 8+
- **Tablet**: iPad, Android tablets

## 🚀 Deploy

### 🌐 Opções de Hospedagem
- **Netlify**: Deploy automático via Git
- **Vercel**: Otimizado para PWAs
- **GitHub Pages**: Hospedagem gratuita
- **Firebase Hosting**: Google Cloud

### ⚙️ Configuração de Build
```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Otimizar assets
npm run optimize

# Deploy
npm run deploy
```

## 🤝 Contribuição

### 📋 Guidelines
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente com testes
4. Faça commit seguindo conventional commits
5. Abra um Pull Request

### 🎯 Áreas de Contribuição
- **Novas funcionalidades**: OCR melhorado, novos tipos de documento
- **Performance**: Otimizações e melhorias
- **Acessibilidade**: Melhorias de a11y
- **Testes**: Cobertura e qualidade
- **Documentação**: Guias e tutoriais

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **Tesseract.js**: OCR engine
- **JsBarcode**: Geração de códigos de barras
- **Workbox**: Service Worker utilities
- **Comunidade Open Source**: Inspiração e recursos

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/cpf-barcode-scanner/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/cpf-barcode-scanner/discussions)
- **Email**: suporte@scanner-documentos.com

---

**Scanner de Documentos v2.0** - Digitalizando o futuro dos documentos brasileiros 🇧🇷

