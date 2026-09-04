import withNuxt from './.nuxt/eslint.config.mjs';

const importSpecifierNewlineRule = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    schema: [
    ],
    messages: {
      expectedNewline: '여러 줄 named import의 각 항목은 별도 줄에 작성해야 합니다.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      ImportDeclaration(node) {
        const specifiers = node.specifiers.filter(
          specifier => specifier.type === 'ImportSpecifier',
        );

        if (specifiers.length < 2 || node.loc.start.line === node.loc.end.line) {
          return;
        }

        for (let index = 1; index < specifiers.length; index += 1) {
          const previousSpecifier = specifiers[index - 1];
          const currentSpecifier = specifiers[index];

          if (previousSpecifier.loc.end.line !== currentSpecifier.loc.start.line) {
            continue;
          }

          context.report({
            node: currentSpecifier,
            messageId: 'expectedNewline',
            fix(fixer) {
              const comma = sourceCode.getTokenAfter(previousSpecifier);

              return fixer.replaceTextRange(
                [
                  comma.range[1],
                  currentSpecifier.range[0],
                ],
                '\n',
              );
            },
          });
        }
      },
    };
  },
};

export default withNuxt(
  {
    plugins: {
      local: {
        rules: {
          'import-specifier-newline': importSpecifierNewlineRule,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      'quotes': [
        'error',
        'single',
      ],
      'semi': [
        'error',
        'always',
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 0,
          maxBOF: 0,
        },
      ],
      'no-multi-spaces': 'error',
      'no-trailing-spaces': [
        'error',
        {
          skipBlankLines: false,
        },
      ],
      'indent': [
        'error',
        2,
      ],
      'comma-dangle': [
        'error',
        {
          arrays: 'always',
          objects: 'always',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
        },
      ],
      'array-bracket-spacing': [
        'error',
        'always',
      ],
      'object-curly-spacing': [
        'error',
        'always',
      ],
      'array-bracket-newline': [
        'error',
        'always',
      ],
      'array-element-newline': [
        'error',
        'always',
      ],
      'object-curly-newline': [
        'error',
        {
          ObjectExpression: {
            multiline: true,
            consistent: true,
          },
          ObjectPattern: {
            multiline: true,
            consistent: true,
          },
          ImportDeclaration: {
            multiline: true,
            consistent: true,
          },
          ExportDeclaration: 'never',
        },
      ],
      'local/import-specifier-newline': 'error',
      'object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: false,
        },
      ],
      'function-paren-newline': [
        'error',
        'multiline-arguments',
      ],
      'function-call-argument-newline': [
        'error',
        'consistent',
      ],
      'vue/html-quotes': [
        'error',
        'double',
      ],
      'vue/require-default-prop': 'off',
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: {
            max: 999,
          },
          multiline: {
            max: 1,
          },
        },
      ],
      'vue/html-closing-bracket-spacing': [
        'error',
        {
          startTag: 'never',
          endTag: 'never',
          selfClosingTag: 'always',
        },
      ],
      'vue/html-closing-bracket-newline': [
        'error',
        {
          singleline: 'never',
          multiline: 'always',
        },
      ],
      'vue/script-indent': [
        'error',
        2,
        {
          baseIndent: 0,
          switchCase: 1,
        },
      ],
      'vue/html-indent': [
        'error',
        2,
        {
          baseIndent: 1,
          attribute: 1,
          closeBracket: 0,
          alignAttributesVertically: true,
          ignores: [
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.vue',
    ],
    rules: {
      indent: 'off',
    },
  },
);
