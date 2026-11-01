# 🌿 miniGit

Um Git didático feito do zero em JavaScript, para entender **como o Git funciona por dentro**: `HEAD`, branches, refs, commits e histórico.

> 🚧 Projeto de estudo, em construção. Não use no lugar do Git de verdade.

## ✨ Duas formas de rodar

| Versão | Onde roda | Estado | Arquivo |
|---|---|---|---|
| 🖥️ **CLI (Node.js)** | Terminal, gravando em disco (`.minigit/`) | ✅ Ativa | `cli.js` |
| 🌐 **Página web** | Navegador, em memória | ⚠️ Desatualizada | `index.html` + `makegit.js` |

A versão web foi a primeira. Ela já tem `commit` e `log`, que o CLI ainda não tem. O CLI é a versão que está evoluindo agora.

## 🚀 Começando (CLI)

Requisitos: [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
git clone https://github.com/lsNicol/meu-git-js.git
cd meu-git-js
npm link          # registra o comando `minigit` na sua máquina
```

Sem o `npm link`, dá para rodar direto com `node cli.js <comando>`.

## 📖 Comandos

| Comando | O que faz |
|---|---|
| `minigit init` | Cria o repositório `.minigit/` com a branch `master` |
| `minigit init -b <nome>` | Cria o repositório com outra branch inicial |
| `minigit branch` | Lista as branches (a atual aparece em verde com `*`) |
| `minigit branch <nome>` | Cria uma branch a partir da atual |
| `minigit branch -d <nome>` | Apaga uma branch (menos a atual) |
| `minigit checkout <nome>` | Troca para uma branch existente |
| `minigit checkout -b <nome>` | Cria uma branch e troca para ela |

Exemplo:

```bash
minigit init
minigit branch feature
minigit checkout feature
minigit checkout -b hotfix
minigit branch            # * hotfix   master   feature
minigit checkout master
minigit branch -d hotfix
```

## 🗂️ Como os dados ficam no disco

O miniGit imita a estrutura real do Git:

```
.minigit/
├── HEAD              # "ref: refs/heads/<branch atual>"
├── objects/          # (reservado para commits e blobs)
└── refs/
    ├── heads/        # um arquivo por branch, contendo o hash do commit
    └── tags/
```

Uma branch é só um arquivo de texto com um hash dentro, e o `HEAD` aponta para ela. Criar uma branch é copiar esse hash para um arquivo novo.

## 🌐 Versão web (desatualizada)

Abra o `index.html` no navegador e use o console (F12). A classe `Git` fica disponível globalmente:

```js
const repo = new Git("meu-repo");
repo.commit("primeiro commit");
repo.checkout("feature");   // cria a branch se ela não existir
repo.commit("segundo commit");
repo.log();
```

Ela mantém tudo em memória, então fecha a aba e perde tudo.

## 🗺️ Roadmap

- [x] `init`, `branch`, `branch -d`
- [x] `checkout` e `checkout -b`
- [ ] `commit` e `log` no CLI
- [ ] Objetos em `objects/` (blobs, trees, commits)
- [ ] `status` e `add`
- [ ] **Versão web nova**: o mesmo código do CLI rodando no navegador, com cache local e uma interface em React interativa

## 🤝 Contribuindo

O projeto é open source e feito para aprender. Issues, ideias e PRs são bem-vindos.

## 📄 Licença

ISC
