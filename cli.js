#!/usr/bin/env node
import fs from "fs";
import path from 'path';

const [,, command, ...args] = process.argv;
const baseDir = '.minigit';
if (command === "init") {

  if (!fs.existsSync(baseDir)){
    fs.mkdirSync(path.join(baseDir, 'refs', 'heads'), { recursive: true });
    fs.mkdirSync(path.join(baseDir, 'refs', 'tags'), { recursive: true });
    fs.mkdirSync(path.join(baseDir, 'objects'), { recursive: true });

    let branchAtual = "master";
    if (args.length >= 2 && args[0][0] === '-'){
      switch(args[0][1]){
        case 'b': 
          branchAtual = args[1];
          break;
      }
    }
    
    fs.writeFileSync(path.join(baseDir, 'refs', 'heads', branchAtual), "");
    fs.writeFileSync(path.join(baseDir, 'HEAD'), `ref: refs/heads/${branchAtual}\n`);
    console.log("Repositório miniGit inicializado com sucessos!");
  } else{
    console.log("O repositório miniGit já existe nesta pasta!");
  }
} 
else if (command === "branch") {
  let branchAtual = fs.readFileSync('.minigit/HEAD', 'utf8').trim().replace('ref: refs/heads/', "");
  if (args.length === 0){
    const branchesList = fs.readdirSync('.minigit/refs/heads').filter(file => file != branchAtual);
    const branchesString = branchesList.join("   ");
    console.log(`* \x1b[32m${branchAtual}\x1b[0m  `, branchesString);
  } 
  else{
    if (args[0][0] === '-'){
    switch (args[0][1]){
      case ('d'):
        const branchParaDeletar = args[1];
        if (!branchParaDeletar) {
          console.log("Erro: Especifique a branch. Ex: minigit branch -d <nome-da-branch>");
          process.exit(1);
        }
        else if (branchParaDeletar === branchAtual){
          console.log(`Erro: Não é possível deletar a branch \x1b[31m${branchParaDeletar}\x1b[0m porque você está nela agora!`);
          process.exit(1);
        }
        const caminhoCompleto = path.join('.minigit', 'refs', 'heads', branchParaDeletar);
        if (fs.existsSync(caminhoCompleto)){
          fs.unlinkSync(caminhoCompleto);
          console.log(`Branch '\x1b[32m${branchParaDeletar}\x1b[0m' deletada com sucesso!`);
        } else {
          console.log(`Erro: A branch '${branchParaDeletar}' não existe.`);
        }
        break;
      }
    }
    else {
      const novaBranch = args[0];
      const caminhoNovaBranch = path.join(baseDir, 'refs', 'heads', novaBranch);
      const caminhoBranchAtiva = path.join(baseDir, 'refs', 'heads', branchAtual);

      if (fs.existsSync(caminhoNovaBranch)) {
        console.log(`Erro: A branch '${novaBranch}' já existe!`);
        process.exit(1);
      }

      let commitHash = '';

      if (fs.existsSync(caminhoBranchAtiva)) {
        commitHash = fs.readFileSync(caminhoBranchAtiva, 'utf-8').trim();
      }
      fs.writeFileSync(caminhoNovaBranch, commitHash === '' ? '' : `${commitHash}\n`);
      console.log(`Branch '\x1b[32m${novaBranch}\x1b[0m' criada com sucesso apontando para '${branchAtual}'!`);
    }
  }
}
else if (command === "checkout") {
  let branchAtual = fs.readFileSync('.minigit/HEAD', 'utf8').trim().replace('ref: refs/heads/', "");
  if (args.length === 0) {
    // deve funcionar igual ao git status
  }
  else {
    if (args[0][0] === '-'){
      switch (args[0][1]) {
        case ('b'):
          const novaBranch = args[1];
          if (!novaBranch){
            console.log("Erro: Especifique a branch. Ex: minigit checkout -b <nome-da-branch>");
            process.exit(1);
          }
          const caminhoNovaBranch = path.join(baseDir, 'refs', 'heads', novaBranch);
          const caminhoBranchAtiva = path.join(baseDir, 'refs', 'heads', branchAtual);
          if (fs.existsSync(caminhoNovaBranch)) {
            console.log(`Erro: A branch '\x1b[32m${novaBranch}\x1b[0m' já existe!`);
            process.exit(1);
          }

          let commitHash = '';

          if (fs.existsSync(caminhoBranchAtiva)) {
            commitHash = fs.readFileSync(caminhoBranchAtiva, 'utf-8').trim();
          }
          fs.writeFileSync(caminhoNovaBranch, commitHash === '' ? '' : `${commitHash}\n`);
          fs.writeFileSync('.minigit/HEAD', `ref: refs/heads/${novaBranch}`);
          console.log(`Switched to a new branch '\x1b[32m${novaBranch}\x1b[0m' apontando para '${branchAtual}'!`);

      }
    }
    else {
      const novaBranch = args[0];
      if (!novaBranch){
        console.log("Erro: Especifique a branch. Ex: minigit checkout <nome-da-branch>");
        process.exit(1);
      }
      const caminhoNovaBranch = path.join(baseDir, 'refs', 'heads', novaBranch);
      if (!fs.existsSync(caminhoNovaBranch)) {
        console.log(`Erro: A branch '\x1b[32m${novaBranch}\x1b[0m' não existe!`);
        process.exit(1);
      }
      fs.writeFileSync('.minigit/HEAD', `ref: refs/heads/${novaBranch}`);
      console.log(`Switched to branch '\x1b[32m${novaBranch}\x1b[0m'`);
    }
  }
}
