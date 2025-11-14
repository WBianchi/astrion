# 🚀 Comandos Git para Publicar o Astrion

## 📋 **PASSO A PASSO COMPLETO**

### 1️⃣ **Inicializar Git (se ainda não fez)**

```bash
cd /home/willian/Área\ de\ Trabalho/vyzer-editor/ai-editor
git init
```

### 2️⃣ **Adicionar Remote do GitHub**

```bash
git remote add origin https://github.com/WBianchi/astrion.git
```

### 3️⃣ **Adicionar todos os arquivos**

```bash
git add .
```

### 4️⃣ **Fazer o primeiro commit**

```bash
git commit -m "feat: versão inicial do Astrion - Editor de código com IA

- Editor Monaco integrado
- Chat com IA (Ollama)
- Sistema DIFF incremental (exclusivo!)
- File Explorer com auto-refresh
- Terminal integrado
- Abas múltiplas com contador de erros
- Code Stats visual (+/-)
- Botão STOP para pausar IA
- Suporte a múltiplos modelos
- 100% gratuito e open source"
```

### 5️⃣ **Criar branch main**

```bash
git branch -M main
```

### 6️⃣ **Push para o GitHub**

```bash
git push -u origin main
```

---

## 🔄 **COMANDOS PARA ATUALIZAÇÕES FUTURAS**

### Adicionar mudanças

```bash
# Ver status
git status

# Adicionar arquivos específicos
git add src/components/AIChat.tsx

# Ou adicionar tudo
git add .
```

### Fazer commit

```bash
# Feature nova
git commit -m "feat: adiciona suporte a tema claro"

# Correção de bug
git commit -m "fix: corrige erro ao salvar arquivo"

# Documentação
git commit -m "docs: atualiza README com exemplos"

# Refatoração
git commit -m "refactor: melhora performance do DIFF"
```

### Push

```bash
git push
```

---

## 🌿 **TRABALHANDO COM BRANCHES**

### Criar nova feature

```bash
# Criar e mudar para nova branch
git checkout -b feature/nova-feature

# Fazer mudanças...
git add .
git commit -m "feat: adiciona nova feature"

# Push da branch
git push -u origin feature/nova-feature
```

### Merge para main

```bash
# Voltar para main
git checkout main

# Merge da feature
git merge feature/nova-feature

# Push
git push
```

### Deletar branch

```bash
# Local
git branch -d feature/nova-feature

# Remoto
git push origin --delete feature/nova-feature
```

---

## 🏷️ **CRIANDO RELEASES**

### Tag de versão

```bash
# Criar tag
git tag -a v1.0.0 -m "Versão 1.0.0 - Lançamento inicial"

# Push da tag
git push origin v1.0.0

# Ou push de todas as tags
git push --tags
```

### Criar release no GitHub

1. Vá para https://github.com/WBianchi/astrion/releases
2. Clique em "Create a new release"
3. Escolha a tag v1.0.0
4. Título: "Astrion v1.0.0 - Lançamento Inicial"
5. Descrição: Cole o conteúdo de CHANGELOG.md
6. Anexe os executáveis (se tiver build)
7. Publique!

---

## 🔍 **COMANDOS ÚTEIS**

### Ver histórico

```bash
# Log completo
git log

# Log resumido
git log --oneline

# Log com gráfico
git log --graph --oneline --all
```

### Ver diferenças

```bash
# Mudanças não commitadas
git diff

# Mudanças entre commits
git diff HEAD~1 HEAD
```

### Desfazer mudanças

```bash
# Desfazer mudanças não commitadas
git checkout -- arquivo.txt

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descarta mudanças)
git reset --hard HEAD~1
```

### Atualizar do remoto

```bash
# Baixar mudanças
git fetch

# Baixar e merge
git pull
```

---

## 📦 **IGNORAR ARQUIVOS**

O `.gitignore` já está configurado para ignorar:

- `node_modules/`
- `dist/`
- `.env`
- Logs
- Arquivos do editor

### Adicionar mais arquivos

```bash
# Edite .gitignore
echo "meu-arquivo-secreto.txt" >> .gitignore

# Commit
git add .gitignore
git commit -m "chore: atualiza gitignore"
```

---

## 🚨 **RESOLVER CONFLITOS**

### Se houver conflito no pull

```bash
# 1. Pull
git pull

# 2. Resolver conflitos manualmente nos arquivos
# Procure por <<<<<<< HEAD

# 3. Adicionar arquivos resolvidos
git add arquivo-com-conflito.txt

# 4. Commit
git commit -m "merge: resolve conflitos"

# 5. Push
git push
```

---

## 🔐 **CONFIGURAÇÃO INICIAL**

### Configurar nome e email

```bash
git config --global user.name "Willian Bianchi"
git config --global user.email "seu-email@example.com"
```

### Configurar editor padrão

```bash
git config --global core.editor "code --wait"
```

### Ver configurações

```bash
git config --list
```

---

## 📊 **ESTATÍSTICAS**

### Ver contribuições

```bash
# Commits por autor
git shortlog -sn

# Linhas adicionadas/removidas
git log --stat

# Arquivos mais modificados
git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -10
```

---

## 🎯 **CHECKLIST ANTES DO PUSH**

- [ ] Código testado localmente
- [ ] Sem erros de lint
- [ ] README atualizado
- [ ] CHANGELOG atualizado (se aplicável)
- [ ] Commit message descritivo
- [ ] .env não commitado
- [ ] Sem arquivos sensíveis

---

## 💡 **DICAS**

### Aliases úteis

```bash
# Adicionar aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'

# Usar
git st  # ao invés de git status
git co main  # ao invés de git checkout main
```

### Commit amend

```bash
# Corrigir último commit
git commit --amend -m "nova mensagem"

# Adicionar arquivo ao último commit
git add arquivo-esquecido.txt
git commit --amend --no-edit
```

---

## 🆘 **PROBLEMAS COMUNS**

### "Permission denied (publickey)"

```bash
# Gerar nova chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Adicionar ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Adicionar ao GitHub
cat ~/.ssh/id_ed25519.pub
# Cole em: GitHub > Settings > SSH Keys
```

### "Updates were rejected"

```bash
# Pull primeiro
git pull --rebase

# Resolver conflitos se houver

# Push
git push
```

### "Large files"

```bash
# Usar Git LFS para arquivos grandes
git lfs install
git lfs track "*.psd"
git add .gitattributes
git commit -m "chore: adiciona Git LFS"
```

---

## 📚 **RECURSOS**

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

<div align="center">

**Pronto para publicar! 🚀**

Execute os comandos na ordem e seu projeto estará no GitHub!

</div>
