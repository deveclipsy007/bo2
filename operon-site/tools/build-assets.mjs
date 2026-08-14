import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'public_html');
const output = resolve(root, 'dist', 'public_html');

await rm(resolve(root, 'dist'), { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, {
  recursive: true,
  filter(path) {
    return !path.endsWith('.env')
      && !path.includes('/storage/logs/')
      && !path.endsWith('.sqlite')
      && !path.endsWith('.db')
      && !path.endsWith('-source.png')
      && !path.endsWith('.gitkeep');
  },
});

process.stdout.write(`Deploy package ready at ${output}\n`);
