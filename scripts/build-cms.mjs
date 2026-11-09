import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {extname,join,relative} from 'node:path';

const assets={};
const types={
 '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp',
 '.woff':'font/woff','.txt':'text/plain; charset=utf-8'
};
async function collect(directory){
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=join(directory,entry.name);
  if(entry.isDirectory())await collect(path);
  else{
   const type=types[extname(path)];
   if(!type)throw new Error('Unsupported static asset: '+path);
   assets['/'+relative('public',path)]=[type,(await readFile(path)).toString('base64')];
  }
 }
}
await collect('public');
await mkdir('dist/server',{recursive:true});
const manifest=await readFile('.openai/hosting.json');
await mkdir('dist/.openai',{recursive:true});
await writeFile('dist/.openai/hosting.json',manifest);
await writeFile('dist/server/index.js','const assets='+JSON.stringify(assets)+';\n'+await readFile('worker/index.mjs','utf8'));
