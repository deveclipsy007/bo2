// Quadros-chave do storyboard: empacota uma vez e renderiza vários instantes (s).  node tools/stills.mjs <pasta> <t1> <t2> ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const [out, ...times] = process.argv.slice(2);
mkdirSync(out, {recursive: true});
const browserExecutable = process.env.BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const inputProps = {audio: 'none'};
const comp = await selectComposition({serveUrl, id: 'Cinco-Motivos', inputProps, browserExecutable, chromeMode: 'headless-shell'});
for (const s of times) {
  const frame = Math.round(parseFloat(s) * comp.fps);
  const file = path.join(out, `t${String(s).padStart(6, '0')}.png`);
  await renderStill({composition: comp, serveUrl, output: file, frame, inputProps, browserExecutable, chromeMode: 'headless-shell', scale: 0.5, timeoutInMilliseconds: 120000});
  console.log('ok', s, frame);
}
