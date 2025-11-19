# 🔌 Guia Completo de MCPs no Astrion

## 📚 **Índice**

- [O que são MCPs?](#o-que-são-mcps)
- [MCPs Disponíveis](#mcps-disponíveis)
- [Como Usar](#como-usar)
- [Exemplos Práticos](#exemplos-práticos)
- [Troubleshooting](#troubleshooting)

---

## 🎯 **O que são MCPs?**

**MCP** (Model Context Protocol) é um protocolo padrão que permite que modelos de IA se conectem a ferramentas externas e fontes de dados.

### **Por que MCPs são importantes?**

- ✅ **Extensibilidade** - Adicione novas capacidades sem modificar o código
- ✅ **Padronização** - Protocolo universal para todas as ferramentas
- ✅ **Segurança** - Controle granular sobre o que a IA pode acessar
- ✅ **Performance** - Comunicação eficiente via stdio

---

## 📦 **MCPs Disponíveis**

### **🟢 MCPs Essenciais (Sempre Disponíveis)**

#### **1. 🗂️ Filesystem**
**Descrição:** Operações avançadas de arquivo e diretório

**Capabilities:**
- Ler/escrever arquivos
- Criar/deletar diretórios
- Listar conteúdo de pastas
- Buscar arquivos por padrão

**Exemplo de uso:**
```
IA: "Crie um arquivo README.md na pasta docs"
→ Usa Filesystem MCP para criar o arquivo
```

---

#### **2. 🧠 Memory**
**Descrição:** Contexto persistente entre sessões

**Capabilities:**
- Salvar informações importantes
- Recuperar contexto de sessões anteriores
- Gerenciar conhecimento acumulado

**Exemplo de uso:**
```
IA: "Lembre-se que este projeto usa React 18"
→ Salva no Memory MCP
→ Próxima sessão: IA já sabe que usa React 18
```

---

#### **3. 🔀 Sequential Thinking**
**Descrição:** Raciocínio passo a passo estruturado

**Capabilities:**
- Quebrar problemas complexos em etapas
- Documentar processo de pensamento
- Validar cada passo antes de continuar

**Exemplo de uso:**
```
IA: "Refatore este componente complexo"
→ Usa Sequential Thinking para:
  1. Analisar código atual
  2. Identificar problemas
  3. Propor solução
  4. Implementar mudanças
  5. Validar resultado
```

---

#### **4. 📦 Git**
**Descrição:** Operações Git integradas

**Capabilities:**
- Commit, push, pull
- Ver diff e histórico
- Criar branches
- Resolver conflitos

**Exemplo de uso:**
```
IA: "Faça commit das mudanças com mensagem descritiva"
→ Usa Git MCP para:
  - git add .
  - git commit -m "feat: adiciona nova feature"
```

---

#### **5. 🌐 Puppeteer**
**Descrição:** Automação de navegador web

**Capabilities:**
- Abrir páginas web
- Interagir com elementos
- Fazer screenshots
- Extrair dados (scraping)

**Exemplo de uso:**
```
IA: "Tire um screenshot da homepage do projeto"
→ Usa Puppeteer MCP para:
  - Abrir navegador
  - Navegar para URL
  - Capturar screenshot
```

---

#### **6. 💻 GitHub**
**Descrição:** Integração com GitHub

**Capabilities:**
- Criar/gerenciar issues
- Abrir/revisar Pull Requests
- Buscar repositórios
- Gerenciar Actions

**Exemplo de uso:**
```
IA: "Crie uma issue para implementar dark mode"
→ Usa GitHub MCP para criar issue com:
  - Título descritivo
  - Labels apropriadas
  - Descrição detalhada
```

---

### **🟡 MCPs Avançados (Requerem Configuração)**

#### **7. 🗄️ PostgreSQL**
**Descrição:** Queries e operações em PostgreSQL

**Configuração necessária:**
```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/db"
```

**Exemplo de uso:**
```
IA: "Liste todos os usuários ativos"
→ SELECT * FROM users WHERE active = true
```

---

#### **8. 📊 SQLite**
**Descrição:** Queries e operações em SQLite

**Exemplo de uso:**
```
IA: "Crie uma tabela de produtos"
→ CREATE TABLE products (...)
```

---

#### **9. 🔍 Brave Search**
**Descrição:** Busca na web via Brave Search API

**Configuração necessária:**
```bash
export BRAVE_API_KEY="seu-api-key"
```

**Exemplo de uso:**
```
IA: "Busque as últimas notícias sobre React 19"
→ Usa Brave Search para buscar e resumir
```

---

#### **10. 🗺️ Google Maps**
**Descrição:** Geocoding e busca de lugares

**Configuração necessária:**
```bash
export GOOGLE_MAPS_API_KEY="seu-api-key"
```

**Exemplo de uso:**
```
IA: "Encontre restaurantes próximos"
→ Busca no Google Maps e lista opções
```

---

#### **11. 💬 Slack**
**Descrição:** Integração com Slack

**Configuração necessária:**
```bash
export SLACK_BOT_TOKEN="xoxb-..."
```

**Exemplo de uso:**
```
IA: "Envie mensagem no canal #dev"
→ Posta mensagem no Slack
```

---

#### **12. ☁️ AWS KB Retrieval**
**Descrição:** Busca em Knowledge Base da AWS

**Configuração necessária:**
```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
```

---

#### **13. 🌐 Fetch**
**Descrição:** Requisições HTTP e web scraping

**Exemplo de uso:**
```
IA: "Busque dados da API do GitHub"
→ Faz GET request e processa resposta
```

---

#### **14. 🎨 EverArt**
**Descrição:** Geração de imagens com IA

**Configuração necessária:**
```bash
export EVERART_API_KEY="..."
```

**Exemplo de uso:**
```
IA: "Gere uma logo para o projeto"
→ Cria imagem usando EverArt
```

---

## 🚀 **Como Usar**

### **1. Conectar um MCP**

1. Clique no ícone **Server** na sidebar
2. Veja a lista de MCPs disponíveis
3. Clique no ícone do servidor para conectar
4. Aguarde o status mudar para verde (✅)

### **2. Verificar Conexão**

No chat, você verá um badge **⚡ N** indicando quantos MCPs estão conectados.

### **3. Usar na Conversa**

Basta pedir para a IA! Ela automaticamente usará os MCPs disponíveis:

```
Você: "Crie um arquivo test.js com um teste básico"
IA: [Usa Filesystem MCP]
    ✅ Arquivo criado!
```

---

## 💡 **Exemplos Práticos**

### **Exemplo 1: Desenvolvimento Full-Stack**

**MCPs conectados:** Filesystem, Git, PostgreSQL

```
Você: "Crie um CRUD completo de usuários"

IA:
1. [Filesystem] Cria models/User.js
2. [Filesystem] Cria routes/users.js
3. [PostgreSQL] Cria tabela users
4. [Git] Commit: "feat: adiciona CRUD de usuários"

✅ CRUD completo criado!
```

---

### **Exemplo 2: Automação Web**

**MCPs conectados:** Puppeteer, Filesystem

```
Você: "Tire screenshots de todas as páginas do site"

IA:
1. [Puppeteer] Abre navegador
2. [Puppeteer] Navega para cada página
3. [Puppeteer] Captura screenshots
4. [Filesystem] Salva em /screenshots

✅ 10 screenshots salvos!
```

---

### **Exemplo 3: Pesquisa e Documentação**

**MCPs conectados:** Brave Search, Memory, Filesystem

```
Você: "Pesquise sobre Next.js 14 e crie um guia"

IA:
1. [Brave Search] Busca informações sobre Next.js 14
2. [Memory] Salva principais features
3. [Filesystem] Cria docs/nextjs-14-guide.md

✅ Guia criado com as últimas features!
```

---

### **Exemplo 4: DevOps**

**MCPs conectados:** Git, GitHub, Slack

```
Você: "Crie uma issue para o bug e notifique o time"

IA:
1. [Git] Verifica branch atual
2. [GitHub] Cria issue #123
3. [Slack] Posta no #bugs: "Nova issue: #123"

✅ Issue criada e time notificado!
```

---

## 🐛 **Troubleshooting**

### **MCP não conecta**

**Problema:** Status fica em "error" (vermelho)

**Soluções:**
```bash
# 1. Verifique se npx está disponível
npx --version

# 2. Limpe cache do npm
npm cache clean --force

# 3. Tente conectar manualmente
npx -y @modelcontextprotocol/server-filesystem /tmp
```

---

### **MCP conecta mas não funciona**

**Problema:** Conectado mas IA não usa

**Soluções:**
1. Desconecte e reconecte o MCP
2. Reinicie o Astrion
3. Verifique logs no console (F12)

---

### **Erro de permissão**

**Problema:** "Permission denied"

**Solução:**
```bash
# Linux/Mac
chmod +x ~/.npm/_npx/*/node_modules/.bin/*

# Ou rode com sudo (não recomendado)
sudo npx -y @modelcontextprotocol/server-filesystem /
```

---

### **MCP avançado requer API key**

**Problema:** "API key not found"

**Solução:**
```bash
# Adicione no .env
echo "BRAVE_API_KEY=seu-key" >> .env

# Ou exporte temporariamente
export BRAVE_API_KEY="seu-key"
```

---

## 📊 **Comparação com Concorrentes**

| Feature | Cursor | Windsurf | Claude Code | **Astrion** |
|---------|--------|----------|-------------|-------------|
| **MCPs Nativos** | ❌ | ❌ | ❌ | ✅ **14 MCPs** |
| **Filesystem MCP** | ⚠️ Limitado | ⚠️ Limitado | ⚠️ Limitado | ✅ **Completo** |
| **Git MCP** | ❌ | ❌ | ❌ | ✅ |
| **Database MCP** | ❌ | ❌ | ❌ | ✅ |
| **Web Automation** | ❌ | ❌ | ❌ | ✅ **Puppeteer** |
| **Extensível** | ❌ | ❌ | ❌ | ✅ **Adicione seus MCPs** |

---

## 🎯 **Próximos MCPs**

Planejamos adicionar:

- [ ] **Docker MCP** - Gerenciar containers
- [ ] **Kubernetes MCP** - Deploy e scaling
- [ ] **Terraform MCP** - Infrastructure as Code
- [ ] **Jira MCP** - Gerenciamento de projetos
- [ ] **Discord MCP** - Integração com Discord
- [ ] **Twitter/X MCP** - Postar e monitorar
- [ ] **Notion MCP** - Documentação automática

---

## 🤝 **Contribuindo**

Quer adicionar um novo MCP?

1. Crie o servidor MCP seguindo o [protocolo oficial](https://modelcontextprotocol.io)
2. Adicione em `src/config/mcpServers.ts`
3. Teste a integração
4. Abra um PR!

---

## 📚 **Recursos**

- [MCP Official Docs](https://modelcontextprotocol.io)
- [MCP GitHub](https://github.com/modelcontextprotocol)
- [Astrion Docs](../README.md)

---

<div align="center">

**MCPs fazem o Astrion ser o editor mais poderoso! 🚀**

[⬆ Voltar ao topo](#-guia-completo-de-mcps-no-astrion)

</div>
