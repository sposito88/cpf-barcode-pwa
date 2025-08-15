# 📱 Guia de Instalação - Scanner de Documentos

## 🚀 Instalação Rápida

### Para Usuários Finais

#### 📱 Mobile (Android/iOS)
1. **Abra o navegador** (Chrome, Safari, Firefox, Edge)
2. **Acesse a URL** da aplicação
3. **Procure o ícone de instalação** na barra de endereços
4. **Toque em "Instalar"** ou "Adicionar à tela inicial"
5. **Confirme a instalação**
6. **Abra o app** da tela inicial

#### 💻 Desktop (Windows/macOS/Linux)
1. **Abra o navegador** (Chrome, Edge, Firefox)
2. **Acesse a URL** da aplicação
3. **Clique no ícone de instalação** (⊕) na barra de endereços
4. **Clique em "Instalar"**
5. **O app será adicionado** ao menu iniciar/dock
6. **Abra como aplicativo nativo**

### Para Desenvolvedores

#### 🛠️ Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/cpf-barcode-scanner.git
cd cpf-barcode-scanner

# Instale um servidor HTTP local (se não tiver)
npm install -g http-server
# ou
python -m http.server 8000

# Execute o servidor
http-server -p 8000
# ou
python -m http.server 8000

# Acesse no navegador
open http://localhost:8000
```

#### 🔧 Build de Produção

```bash
# Otimizar assets
node optimize.js

# Verificar PWA
npx lighthouse http://localhost:8000 --view

# Deploy (exemplo com Netlify)
npm install -g netlify-cli
netlify deploy --prod --dir .
```

## 📋 Pré-requisitos

### 🌐 Navegadores Suportados

#### ✅ Totalmente Suportado
- **Chrome 80+** (Android/Desktop)
- **Safari 13+** (iOS/macOS)
- **Firefox 75+** (Android/Desktop)
- **Edge 80+** (Desktop)

#### ⚠️ Suporte Parcial
- **Samsung Internet 12+**
- **Opera 67+**
- **UC Browser** (funcionalidades limitadas)

### 📱 Dispositivos

#### 📱 Mobile
- **iOS 13+** (iPhone/iPad)
- **Android 8+** (API level 26+)
- **RAM**: Mínimo 2GB recomendado
- **Armazenamento**: 50MB livres

#### 💻 Desktop
- **Windows 10+**
- **macOS 10.15+**
- **Linux** (distribuições modernas)
- **RAM**: Mínimo 4GB
- **Armazenamento**: 100MB livres

### 🔐 Permissões Necessárias

#### 📷 Câmera
- **Obrigatória** para scanner de documentos
- **Solicitada** apenas quando necessário
- **Revogável** a qualquer momento

#### 💾 Armazenamento
- **Local Storage**: Para configurações
- **IndexedDB**: Para histórico de documentos
- **Cache Storage**: Para funcionamento offline

## 🔧 Configuração Avançada

### ⚙️ Variáveis de Ambiente

```javascript
// config.js (opcional)
window.APP_CONFIG = {
  // OCR Settings
  OCR_LANGUAGE: 'por', // Português
  OCR_CONFIDENCE: 60,  // Confiança mínima
  
  // Performance
  MAX_IMAGE_SIZE: 2048,    // Pixels
  CACHE_DURATION: 86400,   // Segundos (24h)
  
  // Features
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: false,
  
  // Debug
  DEBUG_MODE: false,
  VERBOSE_LOGGING: false
};
```

### 🎨 Personalização de Tema

```css
/* custom-theme.css */
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  --accent-color: #your-color;
  --background-color: #your-color;
  --text-color: #your-color;
}
```

### 🔒 Configurações de Segurança

```html
<!-- Adicionar ao <head> para CSP customizado -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: blob:;
               connect-src 'self' https://tessdata.projectnaptha.com;">
```

## 🚀 Deploy em Produção

### 🌐 Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir .

# Configurar domínio customizado (opcional)
netlify domains:add seu-dominio.com
```

### ⚡ Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configurar domínio (opcional)
vercel domains add seu-dominio.com
```

### 🔥 Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init hosting

# Deploy
firebase deploy
```

### 📄 GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 🔍 Verificação da Instalação

### ✅ Checklist Pós-Instalação

#### 📱 PWA Features
- [ ] **Instalação**: App aparece na tela inicial
- [ ] **Ícones**: Ícones corretos em todas as resoluções
- [ ] **Splash Screen**: Tela de carregamento personalizada
- [ ] **Modo Offline**: Funciona sem internet
- [ ] **Shortcuts**: Atalhos rápidos funcionando

#### 🎯 Funcionalidades Core
- [ ] **Câmera**: Acesso e captura funcionando
- [ ] **OCR**: Reconhecimento de texto preciso
- [ ] **Validação**: CPF/CNPJ validados corretamente
- [ ] **Código de Barras**: Geração funcionando
- [ ] **Histórico**: Salvamento e recuperação

#### 🎨 Interface
- [ ] **Responsividade**: Layout adaptativo
- [ ] **Temas**: Alternância escuro/claro
- [ ] **Animações**: Transições suaves
- [ ] **Acessibilidade**: Navegação por teclado

### 🧪 Testes de Funcionalidade

#### 📷 Teste de Scanner
1. **Abra o scanner**
2. **Posicione um documento CPF**
3. **Capture a imagem**
4. **Verifique o reconhecimento**
5. **Confirme a validação**

#### 💾 Teste de Armazenamento
1. **Escaneie um documento**
2. **Salve no histórico**
3. **Feche e reabra o app**
4. **Verifique se o documento está salvo**
5. **Teste a busca no histórico**

#### 🌐 Teste Offline
1. **Use o app online normalmente**
2. **Desconecte da internet**
3. **Reabra o app**
4. **Verifique funcionalidades básicas**
5. **Reconecte e teste sincronização**

## 🐛 Solução de Problemas

### ❌ Problemas Comuns

#### 📱 "App não instala"
**Possíveis causas:**
- Navegador não suporta PWA
- Manifesto inválido
- HTTPS não configurado

**Soluções:**
- Use Chrome/Safari/Firefox atualizado
- Verifique console do navegador
- Certifique-se que está em HTTPS

#### 📷 "Câmera não funciona"
**Possíveis causas:**
- Permissão negada
- Câmera em uso por outro app
- Navegador não suporta getUserMedia

**Soluções:**
- Conceda permissão de câmera
- Feche outros apps que usam câmera
- Use navegador compatível

#### 🔍 "OCR não reconhece texto"
**Possíveis causas:**
- Imagem de baixa qualidade
- Iluminação inadequada
- Documento danificado

**Soluções:**
- Melhore a iluminação
- Mantenha documento plano
- Limpe a lente da câmera

#### 💾 "Histórico não salva"
**Possíveis causas:**
- Armazenamento local cheio
- Modo privado/incógnito
- Configurações do navegador

**Soluções:**
- Limpe dados antigos
- Use modo normal do navegador
- Verifique configurações de armazenamento

### 🔧 Ferramentas de Debug

#### 🌐 Chrome DevTools
```javascript
// Console commands para debug
localStorage.clear(); // Limpar dados locais
caches.keys().then(console.log); // Ver caches
navigator.serviceWorker.getRegistrations().then(console.log); // Ver SW
```

#### 📊 Lighthouse Audit
```bash
# Instalar Lighthouse
npm install -g lighthouse

# Executar audit
lighthouse https://seu-app.com --view

# Audit específico para PWA
lighthouse https://seu-app.com --only-categories=pwa --view
```

## 📞 Suporte

### 🆘 Canais de Suporte
- **GitHub Issues**: Para bugs e problemas técnicos
- **Discussions**: Para dúvidas e sugestões
- **Email**: suporte@scanner-documentos.com
- **Discord**: Comunidade de desenvolvedores

### 📝 Reportar Problemas
Ao reportar problemas, inclua:
- **Navegador e versão**
- **Sistema operacional**
- **Passos para reproduzir**
- **Screenshots/logs**
- **Comportamento esperado**

---

**Instalação concluída com sucesso! 🎉**

Agora você pode começar a usar o Scanner de Documentos para digitalizar seus CPFs e CNPJs com facilidade e segurança.

