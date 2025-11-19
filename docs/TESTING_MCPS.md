# 🧪 Guia de Testes dos MCPs

Este guia mostra como testar cada MCP manualmente para garantir que está funcionando.

---

## 🚀 **TESTE RÁPIDO (Script Automatizado)**

### **1. Teste o Puppeteer:**
```bash
node test-mcp.js puppeteer
```

**O que deve acontecer:**
- ✅ Servidor inicia
- ✅ Lista tools disponíveis
- ✅ Navega para example.com
- ✅ Tira screenshot
- ✅ Retorna sucesso

### **2. Teste o Filesystem:**
```bash
node test-mcp.js filesystem
```

**O que deve acontecer:**
- ✅ Lista tools
- ✅ Lista arquivos do diretório atual

### **3. Teste o Memory:**
```bash
node test-mcp.js memory
```

**O que deve acontecer:**
- ✅ Lista tools
- ✅ Cria entidade de teste

### **4. Teste o Git:**
```bash
node test-mcp.js git
```

**O que deve acontecer:**
- ✅ Lista tools
- ✅ Mostra status do git

---

## 🎯 **TESTE MANUAL (Passo a Passo)**

### **🌐 PUPPETEER**

#### **1. Inicie o servidor:**
```bash
npx -y @modelcontextprotocol/server-puppeteer
```

#### **2. Em outro terminal, envie comandos:**
```bash
# Inicializa
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | npx -y @modelcontextprotocol/server-puppeteer

# Lista tools
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | npx -y @modelcontextprotocol/server-puppeteer
```

#### **3. Teste navegação:**
```bash
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"puppeteer_navigate","arguments":{"url":"https://example.com"}}}' | npx -y @modelcontextprotocol/server-puppeteer
```

**Resultado esperado:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Successfully navigated to https://example.com"
      }
    ]
  }
}
```

#### **4. Teste screenshot:**
```bash
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"puppeteer_screenshot","arguments":{"name":"test"}}}' | npx -y @modelcontextprotocol/server-puppeteer
```

**Resultado esperado:**
- Screenshot salvo em `./screenshots/test.png`

---

### **📁 FILESYSTEM**

#### **1. Inicie o servidor:**
```bash
npx -y @modelcontextprotocol/server-filesystem /tmp
```

#### **2. Liste diretório:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_directory","arguments":{"path":"/tmp"}}}' | npx -y @modelcontextprotocol/server-filesystem /tmp
```

#### **3. Leia arquivo:**
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"read_file","arguments":{"path":"/tmp/test.txt"}}}' | npx -y @modelcontextprotocol/server-filesystem /tmp
```

---

### **🧠 MEMORY**

#### **1. Inicie o servidor:**
```bash
npx -y @modelcontextprotocol/server-memory
```

#### **2. Crie entidade:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"create_entities","arguments":{"entities":[{"name":"Willian","entityType":"person","observations":["Desenvolvedor","Usa React"]}]}}}' | npx -y @modelcontextprotocol/server-memory
```

#### **3. Busque entidade:**
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_nodes","arguments":{"query":"Willian"}}}' | npx -y @modelcontextprotocol/server-memory
```

---

### **📊 GIT**

#### **1. Inicie o servidor:**
```bash
npx -y @modelcontextprotocol/server-git --repository .
```

#### **2. Veja status:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"git_status","arguments":{"repo_path":"."}}}' | npx -y @modelcontextprotocol/server-git --repository .
```

#### **3. Veja log:**
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"git_log","arguments":{"repo_path":".","max_count":5}}}' | npx -y @modelcontextprotocol/server-git --repository .
```

---

## 🔍 **TESTE NO ASTRION (Electron)**

### **1. Inicie o Astrion:**
```bash
pnpm electron:dev
```

### **2. Abra o DevTools (F12)**

### **3. No console, teste manualmente:**

```javascript
// Conecta ao Puppeteer
await window.electronAPI.mcpConnect({
  name: 'Puppeteer',
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-puppeteer'],
  status: 'disconnected'
});

// Lista tools
const tools = await window.electronAPI.mcpListTools('Puppeteer');
console.log('Tools:', tools);

// Navega para uma página
const result = await window.electronAPI.mcpCallTool(
  'Puppeteer',
  'puppeteer_navigate',
  { url: 'https://example.com' }
);
console.log('Resultado:', result);

// Tira screenshot
const screenshot = await window.electronAPI.mcpCallTool(
  'Puppeteer',
  'puppeteer_screenshot',
  { name: 'test' }
);
console.log('Screenshot:', screenshot);
```

---

## ✅ **CHECKLIST DE TESTES**

### **Puppeteer:**
- [ ] Servidor inicia sem erros
- [ ] Lista tools (navigate, screenshot, click, etc)
- [ ] Navega para URL
- [ ] Tira screenshot
- [ ] Screenshot salvo em `./screenshots/`

### **Filesystem:**
- [ ] Servidor inicia sem erros
- [ ] Lista tools (read_file, write_file, list_directory, etc)
- [ ] Lista diretório
- [ ] Lê arquivo
- [ ] Escreve arquivo

### **Memory:**
- [ ] Servidor inicia sem erros
- [ ] Lista tools (create_entities, search_nodes, etc)
- [ ] Cria entidade
- [ ] Busca entidade
- [ ] Retorna resultados corretos

### **Git:**
- [ ] Servidor inicia sem erros
- [ ] Lista tools (git_status, git_log, git_diff, etc)
- [ ] Mostra status
- [ ] Mostra log
- [ ] Mostra diff

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "command not found: npx"**
```bash
# Instale o Node.js/npm
sudo apt install nodejs npm
```

### **Erro: "EACCES: permission denied"**
```bash
# Use um diretório com permissão
npx -y @modelcontextprotocol/server-filesystem /tmp
```

### **Erro: "Cannot find module"**
```bash
# Limpe cache do npx
npx clear-npx-cache
```

### **Puppeteer não abre navegador:**
```bash
# Instale dependências do Chromium (Linux)
sudo apt install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2
```

---

## 📝 **LOGS ÚTEIS**

### **Ver logs do MCP no Electron:**
```javascript
// No DevTools
localStorage.getItem('astrion-mcp-servers')
```

### **Ver logs do servidor MCP:**
```bash
# Redireciona stderr para arquivo
npx -y @modelcontextprotocol/server-puppeteer 2> puppeteer.log
```

---

## 🎯 **PRÓXIMOS PASSOS**

Depois de confirmar que os MCPs funcionam:
1. ✅ Integrar com a IA no chat
2. ✅ Adicionar system prompt com tools disponíveis
3. ✅ Fazer IA chamar tools automaticamente
4. ✅ Exibir resultados no chat

---

**Dúvidas?** Abra uma issue no GitHub! 🚀
