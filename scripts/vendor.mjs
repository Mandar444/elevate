import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'node_modules/three');
const destination=path.join(root,'dist/vendor');
fs.mkdirSync(destination,{recursive:true});
fs.copyFileSync(path.join(source,'build/three.module.min.js'),path.join(destination,'three.module.js'));
fs.copyFileSync(path.join(source,'build/three.core.min.js'),path.join(destination,'three.core.min.js'));
for(const [file,name] of [['examples/jsm/geometries/RoundedBoxGeometry.js','RoundedBoxGeometry.js'],['examples/jsm/utils/BufferGeometryUtils.js','BufferGeometryUtils.js']]){
  const code=fs.readFileSync(path.join(source,file),'utf8').replaceAll("from 'three'","from './three.module.js'");
  fs.writeFileSync(path.join(destination,name),code);
}
fs.copyFileSync(path.join(source,'LICENSE'),path.join(destination,'THREE-LICENSE.txt'));
console.log('Three.js and geometry helpers vendored locally.');
