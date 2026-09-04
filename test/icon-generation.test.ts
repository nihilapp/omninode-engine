import type { IconifyJSON } from '@iconify/types';

import {
  mkdtemp,
  mkdir,
  rm,
  writeFile,
} from 'node:fs/promises';

import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  createIconDataOutput,
  createIconTypeOutput,
  createMinimalIconSet,
  extractReferencedIconNames,
  readIconSourceTexts,
} from '../app/scripts/icon-generation';

const temporaryDirectories: string[] = [
];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(
      async (directoryPath) => await rm(
        directoryPath,
        {
          force: true,
          recursive: true,
        },
      ),
    ),
  );
});

const testIconSet = {
  prefix: 'test-icons',
  width: 24,
  height: 24,
  icons: {
    home: {
      body: '<path id="home" />',
    },
    menu: {
      body: '<path id="menu" />',
    },
  },
  aliases: {
    'home-alt': {
      parent: 'home',
    },
    'home-copy': {
      parent: 'home-alt',
    },
  },
} satisfies IconifyJSON;

describe('extractReferencedIconNames', () => {
  it('지원하는 정적 아이콘 이름을 중복 없이 정렬한다', () => {
    const names = extractReferencedIconNames([
      'const home = \'lucide:home\'; const ignored = \'hero:home\';',
      '<UiIcon icon-name="mdi:github" /><UiIcon icon-name="lucide:home" />',
      'const dynamicIcon = \'mdi:\' + iconName;',
    ]);

    expect(names).toEqual([
      'lucide:home',
      'mdi:github',
    ]);
  });

  it('생성 파일과 스크립트를 제외한 앱 소스만 읽는다', async () => {
    const temporaryDirectory = await mkdtemp(
      join(
        tmpdir(),
        'omninode-icons-',
      ),
    );
    const appDirectory = join(
      temporaryDirectory,
      'app',
    );
    temporaryDirectories.push(temporaryDirectory);

    await Promise.all([
      mkdir(
        join(
          appDirectory,
          'components',
        ),
        {
          recursive: true,
        },
      ),
      mkdir(
        join(
          appDirectory,
          'data',
        ),
        {
          recursive: true,
        },
      ),
      mkdir(
        join(
          appDirectory,
          'scripts',
        ),
        {
          recursive: true,
        },
      ),
      mkdir(
        join(
          appDirectory,
          'types',
        ),
        {
          recursive: true,
        },
      ),
    ]);

    await Promise.all([
      writeFile(
        join(
          appDirectory,
          'components',
          'Header.vue',
        ),
        '<UiIcon icon-name="lucide:home" />',
      ),
      writeFile(
        join(
          appDirectory,
          'data',
          'icons.data.ts',
        ),
        'const excluded = \'mdi:github\';',
      ),
      writeFile(
        join(
          appDirectory,
          'scripts',
          'helper.ts',
        ),
        'const excluded = \'game-icons:axe\';',
      ),
      writeFile(
        join(
          appDirectory,
          'types',
          'icon.generated.ts',
        ),
        'type Excluded = \'simple-icons:github\';',
      ),
      writeFile(
        join(
          appDirectory,
          'ignored.md',
        ),
        'mdi:github',
      ),
    ]);

    const sourceTexts = await readIconSourceTexts(appDirectory);

    expect(extractReferencedIconNames(sourceTexts)).toEqual([
      'lucide:home',
    ]);
  });
});

describe('createMinimalIconSet', () => {
  it('별칭과 부모 사슬 및 최종 원본 아이콘을 함께 보존한다', () => {
    const result = createMinimalIconSet(
      testIconSet,
      [
        'home-copy',
      ],
    );

    expect(result).toEqual({
      aliases: {
        'home-alt': {
          parent: 'home',
        },
        'home-copy': {
          parent: 'home-alt',
        },
      },
      height: 24,
      icons: {
        home: {
          body: '<path id="home" />',
        },
      },
      prefix: 'test-icons',
      width: 24,
    });
  });

  it('존재하지 않는 아이콘 이름을 거부한다', () => {
    expect(() => createMinimalIconSet(
      testIconSet,
      [
        'missing',
      ],
    )).toThrow('test-icons:missing');
  });
});

describe('icon artifact output', () => {
  it('원본 패키지 import 없이 참조 아이콘만 데이터로 생성한다', () => {
    const output = createIconDataOutput(
      [
        'lucide:home',
      ],
      {
        'game-icons': {
          prefix: 'game-icons',
          icons: {},
        },
        lucide: {
          prefix: 'lucide',
          icons: {
            home: {
              body: '<path id="home" />',
            },
            menu: {
              body: '<path id="menu" />',
            },
          },
        },
        mdi: {
          prefix: 'mdi',
          icons: {},
        },
        'simple-icons': {
          prefix: 'simple-icons',
          icons: {},
        },
      },
    );

    expect(output).not.toContain('@iconify-json');
    expect(output).toContain('"home"');
    expect(output).not.toContain('"menu"');
  });

  it('참조가 없는 접두사는 never 타입으로 생성한다', () => {
    const output = createIconTypeOutput([
      'lucide:home',
      'mdi:github',
    ]);

    expect(output).toContain('export type GameIconName = never;');
    expect(output).toContain('  | \'lucide:home\';');
    expect(output).toContain('  | \'mdi:github\';');
    expect(output).toContain('export type SimpleIconName = never;');
    expect(output).toContain('  | \'simple-icons\';');
  });
});
