// BenitoTools: copia in public/ i file WASM self-hosted (non salvati nel repo).
import fs from 'node:fs';
import path from 'node:path';

const out = 'public/mediapipe';
fs.mkdirSync(out, { recursive: true });
const src = 'node_modules/@mediapipe/tasks-vision/wasm';
for (const f of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm']) {
  fs.copyFileSync(path.join(src, f), path.join(out, f));
}
console.log('BenitoTools: mediapipe wasm copiato in', out);
