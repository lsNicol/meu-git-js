#!/usr/bin/env node
import fs from "fs";
import path from 'path';
import zlib from "zlib"; // compactar
import { sha1 } from './sha1.js';

const [,, command, ...args] = process.argv;
const baseDir = '.minigit';

const verde = (txt) => `\x1b[32m${txt}\x1b[0m`;
const vermelho = (txt) => `\x1b[31m${txt}\x1b[0m`;

function erro(msg) {
  console.error(msg);
  process.exit(1);
}

const refPath = (nome) => path.join(baseDir, 'refs', 'heads', nome);
const pathExists = (path) => fs.existsSync(path);

function obterTodosArquivos(dir = '.', listaDeArquivos = []) {
  const arquivos = fs.readdirSync(dir);

  for (const arquivo of arquivos) {
    const caminhoCompleto = path.join(dir, arquivo);
    const proibidos = ['.minigit', '.gitignore', '.git', 'node_modules', '.claude'];
    if (proibidos.includes(arquivo)) {
      continue;
    }

    const stats = fs.statSync(caminhoCompleto);
    if (stats.isDirectory()) {
      obterTodosArquivos(caminhoCompleto, listaDeArquivos);
    } else {
      listaDeArquivos.push(caminhoCompleto.replace(/\\/g, '/'));
    }
  }
  return listaDeArquivos;
}
function lerIndex(){
  const indexPath = ".minigit/index";
  let indexEntries = {};

  if (fs.existsSync(indexPath)) {
    const conteudo = fs.readFileSync(indexPath, 'utf-8');
    conteudo.split("\n").forEach(linha => {
      if (!linha.trim()) return;
      const [mode, hash, ...pathParts] = linha.split(" ");
      const caminho = pathParts.join(" ");
      indexEntries[caminho] = { mode, hash };
    });
  }
  return indexEntries;
}

function lerHashDaBranch(path){
  return (pathExists(path) ? fs.readFileSync(path, 'utf-8').trim() : "");
}

function lerBranchAtual() {
  return fs.readFileSync(path.join(baseDir, 'HEAD'), 'utf8').trim().replace('ref: refs/heads/', "");
}

function escreverHead(nome) {
  fs.writeFileSync(path.join(baseDir, 'HEAD'), `ref: refs/heads/${nome}\n`);
}

function cmdInit(args) {
  if (fs.existsSync(baseDir)) {
    return console.log("O repositório miniGit já existe nesta pasta!");
  }

  const branchInicial = args[0] === '-b' && args[1] ? args[1] : 'master';

  fs.mkdirSync(path.join(baseDir, 'refs', 'heads'), { recursive: true });
  fs.mkdirSync(path.join(baseDir, 'refs', 'tags'), { recursive: true });
  fs.mkdirSync(path.join(baseDir, 'objects'), { recursive: true });

  fs.writeFileSync(refPath(branchInicial), "");
  escreverHead(branchInicial);
  console.log("Repositório miniGit inicializado com sucessos!");
}

function cmdBranch(args) {
  let branchAtual = lerBranchAtual();
  if (args.length === 0){
    const branchesList = fs.readdirSync(path.join(baseDir, 'refs', 'heads')).filter(file => file != branchAtual);
    const branchesString = branchesList.join("   ");
    console.log(`* \x1b[32m${branchAtual}\x1b[0m  `, branchesString);
  }
  else{
    if (args[0][0] === '-'){
      switch (args[0][1]){
        case ('d'):
          const branchParaDeletar = args[1];
          if (!branchParaDeletar) {
            erro("Erro: Especifique a branch. Ex: minigit branch -d <nome-da-branch>");
          }
          else if (branchParaDeletar === branchAtual){
            erro(`Erro: Não é possível deletar a branch \x1b[31m${branchParaDeletar}\x1b[0m porque você está nela agora!`);
          }
          const caminhoCompleto = refPath(branchParaDeletar);
          if (pathExists(caminhoCompleto)){
            fs.unlinkSync(caminhoCompleto);
            console.log(`Branch '\x1b[32m${branchParaDeletar}\x1b[0m' deletada com sucesso!`);
          } else {
            console.log(`Erro: A branch '${branchParaDeletar}' não existe.`);
          }
          break;
        default:
          erro("Erro: Flag inválida. Use: -d");
          break;
      }
    }
    else {
      const novaBranch = args[0];
      const caminhoNovaBranch = refPath(novaBranch);
      const caminhoBranchAtual = refPath(branchAtual);

      if (pathExists(caminhoNovaBranch)) {
        erro(`Erro: A branch '\x1b[32m${novaBranch}\x1b[0m' já existe!`);
      }

      let commitHash = lerHashDaBranch(caminhoBranchAtual);

      fs.writeFileSync(caminhoNovaBranch, commitHash);
      console.log(`Branch '\x1b[32m${novaBranch}\x1b[0m' criada com sucesso apontando para '${branchAtual}'!`);
    }
  }
}

function cmdCheckout(args) {
  let branchAtual = lerBranchAtual();
  if (args.length === 0) {
    // deve funcionar igual ao git status
  }
  else {
    if (args[0][0] === '-'){
      switch (args[0][1]) {
        case ('b'):
          const novaBranch = args[1];
          if (!novaBranch){
            erro("Erro: Especifique a branch. Ex: minigit checkout -b <nome-da-branch>");
          }
          const caminhoNovaBranch = refPath(novaBranch);
          const caminhoBranchAtual = refPath(branchAtual);
          if (pathExists(caminhoNovaBranch)) {
            erro(`Erro: A branch '\x1b[32m${novaBranch}\x1b[0m' já existe!`);
          }

          let commitHash = lerHashDaBranch(caminhoBranchAtual);

          fs.writeFileSync(caminhoNovaBranch, commitHash);
          escreverHead(novaBranch);
          console.log(`Switched to a new branch '\x1b[32m${novaBranch}\x1b[0m' apontando para '${branchAtual}'!`);

      }
    }
    else {
      const novaBranch = args[0];
      if (!novaBranch){
        erro("Erro: Especifique a branch. Ex: minigit checkout <nome-da-branch>");
      }
      const caminhoNovaBranch = refPath(novaBranch);
      if (!pathExists(caminhoNovaBranch)) {
        erro(`Erro: A branch '\x1b[32m${novaBranch}\x1b[0m' não existe!`);
      }
      escreverHead(novaBranch);
      console.log(`Switched to branch '\x1b[32m${novaBranch}\x1b[0m'`);
    }
  }
}

function salvarObjeto(contCompleto, hash){
  const caminhoPasta = path.join(baseDir, "objects", hash.slice(0, 2));
  const caminhoObj = path.join(caminhoPasta, hash.slice(2));
  if (pathExists(caminhoObj)) return;
  fs.mkdirSync(caminhoPasta, { recursive: true });
  fs.writeFileSync(caminhoObj, zlib.deflateSync(contCompleto));
}

function cmdHashObj(args){
  const escrever = args.includes("-w");
  const files = args.filter((a) => a[0] != '-');
  if (files.length === 0) erro("Erro: Especifique o arquivo a ser hasheado. ex: minigit hash-object <nome-do-arquivo>");
  for (const nome of files) {
    const hash = hashearObjeto(nome, escrever);
    console.log(hash);
  }
}

function hashearObjeto(nome, escrever = false, tipo = "blob"){
  const conteudo = fs.readFileSync(nome); // Buffer, sem 'utf8'
  const contCompleto = Buffer.concat([Buffer.from(`${tipo} ${conteudo.length}\0`), conteudo]);
  const hash = sha1(contCompleto);
  if (escrever) salvarObjeto(contCompleto, hash);
  return hash;
}
function cmdAdd(args) {
  let indexEntries = lerIndex();
  const adicionarTudo = args.includes(".");
  let files = args.filter((arq) => arq[0] !== '-'); 

  if (adicionarTudo) {
    files = obterTodosArquivos(); 
  }

  if (files.length === 0) {
    erro("Erro: Especifique o arquivo. Nada adicionado ao stage.");
  }

  for (const nome of files) {
    if (!fs.existsSync(nome)) {
      console.warn(`Aviso: Arquivo '${nome}' não existe.`);
      continue;
    }

    const stats = fs.statSync(nome);
    // Identificar permissão no Linux (100755 para executáveis, 100644 para normais)
    const mode = (stats.mode & 0o111) ? "100755" : "100644";
    const hash = hashearObjeto(nome, true, "blob");
    
    indexEntries[nome] = { mode, hash };
    console.log(`Adicionado: ${nome} -> ${hash.slice(0, 8)}`);
  }

  const novasLinhas = Object.keys(indexEntries).map(caminho => {
    const entry = indexEntries[caminho];
    return `${entry.mode} ${entry.hash} ${caminho}`;
  });
  novasLinhas.sort(); 

  fs.writeFileSync(indexPath, novasLinhas.join('\n') + '\n', 'utf-8');
}

// ---------- dispatcher ----------
const comandos = {
  init: cmdInit,
  branch: cmdBranch,
  checkout: cmdCheckout,
  add: cmdAdd,
  "hash-object": cmdHashObj
};

const executar = comandos[command];
if (!executar) erro(`Comando desconhecido: ${command ?? '(nenhum)'}. Use: ${Object.keys(comandos).join(', ')}`);
executar(args);
