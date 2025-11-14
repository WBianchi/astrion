# 🤝 Guia de Contribuição - Astrion

Obrigado por considerar contribuir com o Astrion! 🎉

Este documento fornece diretrizes para contribuir com o projeto.

---

## 📋 Índice

- [Código de Conduta](#-código-de-conduta)
- [Como Contribuir](#-como-contribuir)
- [Reportando Bugs](#-reportando-bugs)
- [Sugerindo Features](#-sugerindo-features)
- [Pull Requests](#-pull-requests)
- [Estilo de Código](#-estilo-de-código)
- [Estrutura de Commits](#-estrutura-de-commits)

---

## 📜 Código de Conduta

### Nossos Valores

- **Respeito**: Trate todos com respeito e empatia
- **Colaboração**: Trabalhe em equipe e ajude outros
- **Inclusão**: Todos são bem-vindos, independente de experiência
- **Qualidade**: Busque sempre a excelência no código

### Comportamentos Esperados

✅ Seja respeitoso e profissional
✅ Aceite críticas construtivas
✅ Foque no que é melhor para a comunidade
✅ Mostre empatia com outros membros

### Comportamentos Inaceitáveis

❌ Linguagem ofensiva ou discriminatória
❌ Assédio de qualquer tipo
❌ Trolling ou comentários depreciativos
❌ Publicação de informações privadas

---

## 🚀 Como Contribuir

### 1️⃣ Fork e Clone

```bash
# Fork no GitHub
# Depois clone seu fork
git clone https://github.com/SEU-USUARIO/astrion.git
cd astrion

# Adicione o repositório original como upstream
git remote add upstream https://github.com/WBianchi/astrion.git
```

### 2️⃣ Crie uma Branch

```bash
# Sempre crie uma branch para suas mudanças
git checkout -b feature/minha-feature

# Ou para correções
git checkout -b fix/correcao-bug
```

### 3️⃣ Faça suas Mudanças

- Siga o [Estilo de Código](#-estilo-de-código)
- Adicione testes quando possível
- Documente novas features
- Mantenha commits pequenos e focados

### 4️⃣ Teste suas Mudanças

```bash
# Rode os testes
pnpm test

# Teste localmente
pnpm electron:dev

# Verifique lint
pnpm lint
```

### 5️⃣ Commit

```bash
# Use commits semânticos
git commit -m "feat: adiciona suporte a tema claro"
```

### 6️⃣ Push e PR

```bash
# Push para seu fork
git push origin feature/minha-feature

# Abra um Pull Request no GitHub
```

---

## 🐛 Reportando Bugs

### Antes de Reportar

- ✅ Verifique se o bug já foi reportado
- ✅ Teste na versão mais recente
- ✅ Colete informações sobre o ambiente

### Como Reportar

Use o template de issue no GitHub:

```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Como Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [e.g. Ubuntu 22.04]
- Versão do Astrion: [e.g. 1.0.0]
- Versão do Node: [e.g. 18.0.0]
- Modelo de IA: [e.g. glm4:9b]
```

---

## 💡 Sugerindo Features

### Antes de Sugerir

- ✅ Verifique se já foi sugerido
- ✅ Pense se é útil para a maioria dos usuários
- ✅ Considere a complexidade de implementação

### Como Sugerir

```markdown
**Descrição da Feature**
Descrição clara do que você quer.

**Problema que Resolve**
Por que essa feature é necessária?

**Solução Proposta**
Como você imagina que funcione?

**Alternativas Consideradas**
Outras formas de resolver o problema.

**Contexto Adicional**
Screenshots, mockups, etc.
```

---

## 🔀 Pull Requests

### Checklist

Antes de abrir um PR, certifique-se:

- [ ] Código segue o estilo do projeto
- [ ] Commits são semânticos
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] PR tem descrição clara
- [ ] Branch está atualizada com main

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Screenshots
Se aplicável.

## Checklist
- [ ] Código testado
- [ ] Documentação atualizada
- [ ] Commits semânticos
```

---

## 🎨 Estilo de Código

### TypeScript/React

```typescript
// ✅ BOM
interface UserProps {
  name: string;
  age: number;
}

export function User({ name, age }: UserProps) {
  return <div>{name} - {age}</div>;
}

// ❌ RUIM
function user(props: any) {
  return <div>{props.name} - {props.age}</div>
}
```

### Regras Gerais

- **Indentação**: 2 espaços
- **Aspas**: Simples `'` para strings
- **Ponto e vírgula**: Sempre usar
- **Imports**: Ordenados alfabeticamente
- **Nomes**: camelCase para variáveis, PascalCase para componentes

### ESLint

```bash
# Rode o linter
pnpm lint

# Corrija automaticamente
pnpm lint:fix
```

---

## 📝 Estrutura de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/).

### Tipos

- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### Exemplos

```bash
# Feature
git commit -m "feat: adiciona suporte a tema claro"

# Bug fix
git commit -m "fix: corrige erro ao salvar arquivo"

# Documentação
git commit -m "docs: atualiza README com novos exemplos"

# Refatoração
git commit -m "refactor: simplifica lógica do FileExplorer"

# Breaking change
git commit -m "feat!: remove suporte a Node 16"
```

---

## 🏗️ Áreas para Contribuir

### 🟢 Fácil (Bom para Iniciantes)

- Corrigir typos na documentação
- Adicionar exemplos ao README
- Melhorar mensagens de erro
- Adicionar testes unitários
- Traduzir documentação

### 🟡 Médio

- Implementar novos temas
- Adicionar suporte a novos modelos
- Melhorar performance
- Criar componentes UI
- Implementar shortcuts

### 🔴 Avançado

- Implementar extensões/plugins
- Adicionar debugger
- Implementar Git integration
- Criar sistema de colaboração
- Otimizar DIFF algorithm

---

## 🎓 Recursos

### Documentação

- [README.md](README.md) - Documentação principal
- [SISTEMA_DIFF_INCREMENTAL.md](SISTEMA_DIFF_INCREMENTAL.md) - Sistema DIFF

### Tecnologias

- [React](https://react.dev/) - Framework UI
- [TypeScript](https://www.typescriptlang.org/) - Linguagem
- [Electron](https://www.electronjs.org/) - Desktop app
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Editor
- [Ollama](https://ollama.com/) - Modelos de IA

---

## 💬 Comunidade

### Onde Pedir Ajuda

- **Issues**: Para bugs e features
- **Discussions**: Para perguntas gerais
- **Discord**: [Em breve]

### Mantenedores

- [@WBianchi](https://github.com/WBianchi) - Criador e mantenedor principal

---

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [Licença MIT](LICENSE).

---

<div align="center">

**Obrigado por contribuir com o Astrion! 🚀**

Juntos vamos criar o melhor editor de código com IA do mundo!

</div>
