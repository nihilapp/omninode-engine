import fs from 'node:fs';
import path from 'node:path';
import {
  describe,
  expect,
  it,
} from 'vitest';

const sourceRoots = [
  'app',
  'server',
  'test',
];

const legacyApiUtilityPath = [
  '~',
  'utils',
  'api',
].join('/');
const legacyUsersApiPath = [
  '',
  'api',
  'v1',
  'users',
].join('/');
const legacyUsersApiPathWithoutVersion = [
  '',
  'api',
  'users',
].join('/');
const responseTypesModule = [
  'response',
  'types',
].join('.');

const forbiddenImports = [
  `~/types/${responseTypesModule}`,
  legacyApiUtilityPath,
  legacyUsersApiPath,
  legacyUsersApiPathWithoutVersion,
];

const removedSourcePaths = [
  `app/types/${responseTypesModule}.ts`,
  'app/utils/api/api.ts',
  'app/utils/api/index.ts',
  'app/utils/api/README.md',
  'app/composables/domain/user',
  'app/keys/users.keys.ts',
  'app/types/user.types.ts',
  `server/routes${legacyUsersApiPath}/index.get.ts`,
];

const supportedExtensions = new Set([
  '.js',
  '.ts',
  '.vue',
]);

const contractFilePath = path.resolve(
  'test/type-import-paths.contract.js',
);

function getSourceFilePaths(
  directoryPath,
) {
  return fs.readdirSync(
    directoryPath,
    {
      withFileTypes: true,
    },
  ).flatMap(
    (entry) => {
      const entryPath = path.join(
        directoryPath,
        entry.name,
      );

      if (entry.isDirectory()) {
        return getSourceFilePaths(entryPath);
      }

      return supportedExtensions.has(path.extname(entry.name))
        ? [
          entryPath,
        ]
        : [
        ];
    },
  );
}

describe('type import paths contract', () => {
  it('제거된 응답 타입과 예제 API 경로를 소비하지 않는다', () => {
    const sourceFilePaths = sourceRoots.flatMap(
      (sourceRoot) => getSourceFilePaths(sourceRoot),
    ).filter(
      (sourceFilePath) => path.resolve(sourceFilePath) !== contractFilePath,
    );

    const violations = sourceFilePaths.flatMap(
      (sourceFilePath) => {
        const source = fs.readFileSync(
          sourceFilePath,
          'utf8',
        );

        return forbiddenImports
          .filter(
            (forbiddenImport) => source.includes(forbiddenImport),
          )
          .map(
            (forbiddenImport) => `${sourceFilePath}: ${forbiddenImport}`,
          );
      },
    );

    expect(violations).toEqual([
    ]);
  });

  it('중복 타입·요청기와 예제 사용자 기능을 보관하지 않는다', () => {
    const remainingSourcePaths = removedSourcePaths.filter(
      (removedSourcePath) => fs.existsSync(removedSourcePath),
    );

    expect(remainingSourcePaths).toEqual([
    ]);
  });
});
