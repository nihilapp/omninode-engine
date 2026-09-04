import type { IconifyJSON } from '@iconify/types';

import {
  readFile,
  readdir,
} from 'node:fs/promises';

import {
  extname,
  join,
} from 'node:path';

export const supportedIconPrefixes = [
  'game-icons',
  'lucide',
  'mdi',
  'simple-icons',
] as const;

const iconPattern = new RegExp(
  `(?:${supportedIconPrefixes.join('|')}):[a-z0-9]+(?:-[a-z0-9]+)*`,
  'g',
);

const iconTypeNames = {
  'game-icons': 'GameIconName',
  lucide: 'LucideIconName',
  mdi: 'MdiIconName',
  'simple-icons': 'SimpleIconName',
} as const;

const excludedSourcePaths = new Set([
  'data/icons.data.ts',
  'types/icon.generated.ts',
]);

export async function readIconSourceTexts(
  appDirectory: string,
): Promise<string[]> {
  const sourceFilePaths: string[] = [
  ];

  const onReadDirectory = async (
    directoryPath: string,
    relativeDirectoryPath: string,
  ): Promise<void> => {
    const entries = await readdir(
      directoryPath,
      {
        withFileTypes: true,
      },
    );

    await Promise.all(
      entries.map(
        async (entry) => {
          const relativePath = relativeDirectoryPath
            ? `${relativeDirectoryPath}/${entry.name}`
            : entry.name;
          const entryPath = join(
            directoryPath,
            entry.name,
          );

          if (entry.isDirectory()) {
            if (relativePath === 'scripts') {
              return;
            }

            await onReadDirectory(
              entryPath,
              relativePath,
            );
            return;
          }

          if (
            !excludedSourcePaths.has(relativePath)
            && [
              '.ts',
              '.vue',
            ].includes(extname(entry.name))
          ) {
            sourceFilePaths.push(entryPath);
          }
        },
      ),
    );
  };

  await onReadDirectory(
    appDirectory,
    '',
  );

  return await Promise.all(
    sourceFilePaths
      .sort(
        (firstPath, secondPath) => firstPath.localeCompare(secondPath),
      )
      .map(
        async (sourceFilePath) => await readFile(
          sourceFilePath,
          'utf8',
        ),
      ),
  );
}

export function extractReferencedIconNames(
  sources: readonly string[],
): string[] {
  const names = new Set<string>();

  for (const source of sources) {
    for (const name of source.match(iconPattern) ?? [
    ]) {
      names.add(name);
    }
  }

  return [
    ...names,
  ].sort(
    (firstName, secondName) => firstName.localeCompare(secondName),
  );
}

export function createMinimalIconSet(
  iconSet: IconifyJSON,
  referencedNames: readonly string[],
): IconifyJSON {
  const icons: IconifyJSON['icons'] = {};
  const aliases: NonNullable<IconifyJSON['aliases']> = {};

  const onAddIcon = (
    iconName: string,
    parents: Set<string>,
  ): void => {
    const icon = iconSet.icons[iconName];

    if (icon) {
      icons[iconName] = icon;
      return;
    }

    const alias = iconSet.aliases?.[iconName];

    if (!alias || parents.has(iconName)) {
      throw new Error(
        `[icons] 아이콘을 찾을 수 없습니다: ${iconSet.prefix}:${iconName}`,
      );
    }

    aliases[iconName] = alias;

    const nextParents = new Set(parents);
    nextParents.add(iconName);
    onAddIcon(
      alias.parent,
      nextParents,
    );
  };

  for (const iconName of referencedNames) {
    onAddIcon(
      iconName,
      new Set(),
    );
  }

  return {
    ...(Object.keys(aliases).length > 0
      ? {
        aliases,
      }
      : {}),
    ...(iconSet.height === undefined
      ? {}
      : {
        height: iconSet.height,
      }),
    icons,
    prefix: iconSet.prefix,
    ...(iconSet.width === undefined
      ? {}
      : {
        width: iconSet.width,
      }),
  };
}

export function createIconDataOutput(
  referencedIconNames: readonly string[],
  iconSets: Record<string, IconifyJSON>,
): string {
  const minimalIconSets = Object.fromEntries(
    supportedIconPrefixes.map(
      (prefix) => {
        const iconSet = iconSets[prefix];

        if (!iconSet) {
          throw new Error(
            `[icons] 아이콘 세트를 찾을 수 없습니다: ${prefix}`,
          );
        }

        const names = referencedIconNames
          .filter(
            (iconName) => iconName.startsWith(`${prefix}:`),
          )
          .map(
            (iconName) => iconName.slice(prefix.length + 1),
          );

        return [
          prefix,
          createMinimalIconSet(
            iconSet,
            names,
          ),
        ];
      },
    ),
  );

  return `/* eslint-disable */
/**
 * 이 파일은 자동 생성됩니다.
 * 직접 수정하지 마십시오.
 */

import type { IconifyJSON } from '@iconify/types';

export const iconSets = ${JSON.stringify(minimalIconSets, null, 2)} satisfies Record<string, IconifyJSON>;
`;
}

export function createIconTypeOutput(
  referencedIconNames: readonly string[],
): string {
  const typeBlocks = supportedIconPrefixes.map(
    (prefix) => {
      const names = referencedIconNames.filter(
        (iconName) => iconName.startsWith(`${prefix}:`),
      );
      const typeName = iconTypeNames[prefix];

      if (names.length === 0) {
        return `export type ${typeName} = never;`;
      }

      const values = names
        .map((name) => `  | '${name}'`)
        .join('\n');

      return `export type ${typeName} =\n${values};`;
    },
  );

  const prefixValues = supportedIconPrefixes
    .map((prefix) => `  | '${prefix}'`)
    .join('\n');

  return `/**
 * 이 파일은 자동 생성됩니다.
 * 직접 수정하지 마십시오.
 */

${typeBlocks.join('\n\n')}

export type IconPrefix =
${prefixValues};

export type UiIconName =
  | GameIconName
  | LucideIconName
  | MdiIconName
  | SimpleIconName;
`;
}
