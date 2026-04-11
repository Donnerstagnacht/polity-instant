import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const sourceDir = path.resolve('.vinxi/build/client/_build');
const targetDirs = [
  path.resolve('public/_build'),
  path.resolve('.output/public/_build'),
];

for (const targetDir of targetDirs) {
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(path.dirname(targetDir), { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true });
}