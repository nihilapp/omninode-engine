import { icons as gameIcons } from '@iconify-json/game-icons';
import { icons as lucideIcons } from '@iconify-json/lucide';
import { icons as mdiIcons } from '@iconify-json/mdi';
import { icons as simpleIcons } from '@iconify-json/simple-icons';

import {
  mkdir,
  writeFile,
} from 'node:fs/promises';

import { resolve } from 'node:path';
import type { IconifyJSON } from '@iconify/types';

import {
  createIconDataOutput,
  createIconTypeOutput,
  extractReferencedIconNames,
  readIconSourceTexts,
} from './icon-generation';

const iconSets = {
  'game-icons': gameIcons,
  lucide: lucideIcons,
  mdi: mdiIcons,
  'simple-icons': simpleIcons,
} satisfies Record<string, IconifyJSON>;

const appDirectory = resolve(
  process.cwd(),
  'app',
);
const dataDirectory = resolve(
  appDirectory,
  'data',
);
const typeDirectory = resolve(
  appDirectory,
  'types',
);
const dataOutputFile = resolve(
  dataDirectory,
  'icons.data.ts',
);
const typeOutputFile = resolve(
  typeDirectory,
  'icon.generated.ts',
);

const sourceTexts = await readIconSourceTexts(appDirectory);
const referencedIconNames = extractReferencedIconNames(sourceTexts);

await Promise.all([
  mkdir(
    dataDirectory,
    {
      recursive: true,
    },
  ),
  mkdir(
    typeDirectory,
    {
      recursive: true,
    },
  ),
]);

await Promise.all([
  writeFile(
    dataOutputFile,
    createIconDataOutput(
      referencedIconNames,
      iconSets,
    ),
    'utf8',
  ),
  writeFile(
    typeOutputFile,
    createIconTypeOutput(referencedIconNames),
    'utf8',
  ),
]);

console.log(
  `[icons] ${referencedIconNames.length}개 아이콘 데이터와 타입 생성 완료`,
);
