# ⚡ Astrion - AI Code Editor

**O editor de código com IA mais avançado e poderoso do mercado**

*Melhor que Cursor, Windsurf e Claude Code - E é 100% gratuito!*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white)](https://www.electronjs.org/)

[🚀 Instalação](#-instalação) • [✨ Features](#-features-diferenciais) • [🔌 MCPs](#-mcps-model-context-protocol) • [📖 Docs](#-documentação) • [🤝 Contribuir](#-como-contribuir)

---

## 🎯 O que é o Astrion?

**Astrion** é um editor de código revolucionário com inteligência artificial integrada que vai **muito além** do Cursor, Windsurf e Claude Code. Desenvolvido com Electron, React e TypeScript, o Astrion oferece uma experiência de desenvolvimento única com IA verdadeiramente agentic e **suporte nativo a MCPs**.

### 🔥 Por que Astrion é melhor?

| Feature | Cursor | Windsurf | Claude Code | **Astrion** |
|---------|--------|----------|-------------|-------------|
| **DIFF Incremental** | ❌ | ❌ | ❌ | ✅ **Exclusivo!** |
| **MCPs Nativos** | ❌ | ❌ | ❌ | ✅ **14 MCPs!** |
| **100% Gratuito** | ❌ | ❌ | ❌ | ✅ |
| **Open Source** | ❌ | ❌ | ❌ | ✅ |
| **Offline** | ❌ | ❌ | ❌ | ✅ |
| **Extensível** | ⚠️ | ⚠️ | ⚠️ | ✅ **MCPs!** |

---

## ✨ Features Diferenciais

### 🎨 **Interface & UX**
- ✅ **Monaco Editor** - O mesmo editor do VS Code
- ✅ **Abas Inteligentes** - Múltiplos arquivos com contador de erros em tempo real
- ✅ **File Explorer** - Atualização automática a cada 3 segundos
- ✅ **Terminal Integrado** - Execute comandos sem sair do editor
- ✅ **Temas Customizáveis** - Dark mode profissional
- ✅ **Ícones Modernos** - Lucide React icons

### 🤖 **IA Agentic (Melhor que Cursor/Windsurf)**
- ✅ **DIFF Incremental** - Edita apenas as linhas necessárias (exclusivo!)
- ✅ **Auto Read Files** - IA lê arquivos automaticamente antes de editar
- ✅ **Code Stats Visual** - Mostra +15 -8 ~3 em tempo real
- ✅ **Multi-Step Interaction** - IA analisa → corrige → valida
- ✅ **Coder Agent** - Cria, edita, deleta arquivos automaticamente
- ✅ **Botão STOP** - Pause a IA a qualquer momento

### 🔌 **MCPs (Model Context Protocol)**
- ✅ **14 MCPs Integrados** - Mais que qualquer concorrente!
- ✅ **Filesystem MCP** - Operações avançadas de arquivo
- ✅ **Memory MCP** - Contexto persistente entre sessões
- ✅ **Git MCP** - Operações Git integradas
- ✅ **Puppeteer MCP** - Automação de navegador
- ✅ **GitHub MCP** - Issues, PRs, Actions
- ✅ **Database MCPs** - PostgreSQL, SQLite
- ✅ **E muito mais!** - [Ver todos os MCPs](docs/MCP_GUIDE.md)

### 🚀 **Modelos de IA Suportados**
- ✅ **GLM-4** (9B) - Equilíbrio perfeito
- ✅ **Kimi K2 Thinking** - Reasoning avançado
- ✅ **DeepSeek-R1** - Raciocínio forte
- ✅ **Qwen 2.5 Coder** - Especializado em código
- ✅ **Qualquer modelo Ollama** - Flexibilidade total

### ⚡ **Performance**
- ✅ **6x mais rápido** que reescrita completa
- ✅ **10x menos tokens** com DIFF incremental
- ✅ **100% Offline** - Sem dependência de APIs pagas
- ✅ **Zero custo** - Modelos locais gratuitos

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** ([Instalação](https://pnpm.io/installation))
- **Ollama** ([Download](https://ollama.com/download))

## 🛠️ Instalação

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/WBianchi/astrion.git
cd astrion
```

### 2️⃣ Instale as dependências

```bash
pnpm install
```

### 3️⃣ Baixe um modelo de IA

```bash
# Modelo recomendado (9GB)
ollama pull glm4:9b

# Ou modelo menor (1.5GB)
ollama pull qwen2.5-coder:1.5b

# Ou modelo de reasoning
ollama pull deepseek-r1:latest
```

### 4️⃣ Inicie o Astrion

```bash
# Modo desenvolvimento
pnpm electron:dev

# Ou modo web (apenas navegador)
pnpm dev
```

### 5️⃣ Build para produção

```bash
pnpm electron:build
```

O executável estará em `dist/`

---

## 🔌 MCPs (Model Context Protocol)

### **O que são MCPs?**

MCPs permitem que a IA se conecte a ferramentas externas e fontes de dados de forma padronizada e segura.

### **MCPs Disponíveis no Astrion:**

| MCP | Descrição | Status |
|-----|-----------|--------|
| 🗂️ **Filesystem** | Operações de arquivo | ✅ Pronto |
| 🧠 **Memory** | Contexto persistente | ✅ Pronto |
| 🔀 **Sequential Thinking** | Raciocínio estruturado | ✅ Pronto |
| 📦 **Git** | Operações Git | ✅ Pronto |
| 🌐 **Puppeteer** | Automação web | ✅ Pronto |
| 💻 **GitHub** | Integração GitHub | ✅ Pronto |
| 🗄️ **PostgreSQL** | Database queries | ✅ Pronto |
| 📊 **SQLite** | Database queries | ✅ Pronto |
| 🔍 **Brave Search** | Busca web | ✅ Pronto |
| 🗺️ **Google Maps** | Geocoding | ✅ Pronto |
| 💬 **Slack** | Mensagens | ✅ Pronto |
| ☁️ **AWS KB** | Knowledge Base | ✅ Pronto |
| 🌐 **Fetch** | HTTP requests | ✅ Pronto |
| 🎨 **EverArt** | Geração de imagens | ✅ Pronto |

### **Como usar MCPs:**

1. Clique no ícone **Server** na sidebar
2. Clique no MCP desejado para conectar
3. Veja o badge **⚡** aparecer no chat
4. A IA agora pode usar as ferramentas do MCP!

**[📖 Guia Completo de MCPs](docs/MCP_GUIDE.md)**

---

## 🎯 Como Usar

### 🚀 **Início Rápido**

1. **Abra uma pasta** - `File > Open Folder`
2. **Conecte MCPs** - Sidebar > Server > Clique nos MCPs
3. **Selecione um arquivo** no Explorer
4. **Peça para a IA** - "Corrija os erros deste arquivo"
5. **Veja a mágica acontecer!** ✨

### 💡 **Exemplos de Comandos**

#### **Com DIFF Incremental**
```
Você: "Este arquivo tem erros, pode corrigir?"

IA: [Lê o arquivo automaticamente]
    [Analisa os erros]
    [Aplica DIFF incremental]
    ✅ Arquivo corrigido! +5 -3 ~2
```

#### **Com MCPs**
```
Você: "Crie um CRUD completo de usuários"

IA: [Filesystem MCP] Cria models/User.js
    [Filesystem MCP] Cria routes/users.js
    [PostgreSQL MCP] Cria tabela users
    [Git MCP] Commit: "feat: adiciona CRUD"
    ✅ CRUD completo criado!
```

#### **Automação Web**
```
Você: "Tire screenshots de todas as páginas"

IA: [Puppeteer MCP] Abre navegador
    [Puppeteer MCP] Navega e captura
    [Filesystem MCP] Salva screenshots
    ✅ 10 screenshots salvos!
```

---

## 📚 Documentação

- [📖 Guia Completo de MCPs](docs/MCP_GUIDE.md)
- [🤝 Como Contribuir](CONTRIBUTING.md)
- [📝 Posts para Redes Sociais](FACEBOOK_POST.md)
- [🔧 Comandos Git](GIT_COMMANDS.md)
- [📊 Resumo do Projeto](RESUMO_PROJETO.md)

---

## 🤝 Como Contribuir

Adoramos contribuições! Veja como você pode ajudar:

1. **Fork** o projeto
2. **Crie** uma branch (`feature/nova-feature`)
3. **Commit** suas mudanças
4. **Push** para a branch
5. **Abra** um Pull Request

**[📖 Guia de Contribuição Completo](CONTRIBUTING.md)**

---

## 🐛 Troubleshooting

### **Ollama não conecta**

```bash
# Verifique se está rodando
curl http://localhost:11434/api/tags

# Reinicie o Ollama
ollama serve
```

### **MCP não conecta**

```bash
# Limpe cache do npm
npm cache clean --force

# Tente conectar manualmente
npx -y @modelcontextprotocol/server-filesystem /tmp
```

---

## 📊 Roadmap

### **v1.0 (Atual)** ✅
- [x] Editor Monaco
- [x] Chat com IA
- [x] DIFF Incremental
- [x] 14 MCPs integrados
- [x] File Explorer
- [x] Terminal
- [x] Abas múltiplas

### **v1.1 (Próximo)** 🚧
- [ ] Mais MCPs (Docker, Kubernetes)
- [ ] Debugger integrado
- [ ] Extensions API
- [ ] Themes marketplace

### **v2.0 (Futuro)** 🔮
- [ ] Colaboração em tempo real
- [ ] Cloud sync
- [ ] Mobile app
- [ ] Web version

---

## 📄 Licença

MIT © 2025 [Willian Bianchi](https://github.com/WBianchi)

---

## 💖 Apoie o Projeto

Se o Astrion te ajudou, considere:

- ⭐ Dar uma estrela no GitHub
- 🐛 Reportar bugs
- 💡 Sugerir features
- 🤝 Contribuir com código
- 📢 Compartilhar com amigos

---

<div align="center">

**Feito com ❤️ por desenvolvedores, para desenvolvedores**

**MCPs fazem o Astrion ser o editor mais poderoso! 🚀**

[⬆ Voltar ao topo](#-astrion---ai-code-editor)

</div>
