module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new functionality
        'fix', // bug fix
        'docs', // documentation changes
        'style', // formatting, missing semicolons etc.
        'refactor', // code refactoring
        'perf', // performance improvements
        'test', // adding tests
        'chore', // build process or auxiliary tool changes
        'ci', // CI/CD changes
        'build', // build system changes
        'revert', // reverting changes
      ],
    ],

    // Scope must be in lower case
    'scope-case': [2, 'always', 'lower-case'],

    // Scope is optional, but if present - must be from the list
    'scope-enum': [
      2,
      'always',
      [
        // Projects
        'core',
        'demos',
        'cdk-interop',
        'docs',

        // Release
        'release',
      ],
    ],

    // Subject must be in lower case
    'subject-case': [2, 'always', 'lower-case'],

    // Subject should not end with a period
    'subject-full-stop': [2, 'never', '.'],

    // Maximum length of the entire message
    'header-max-length': [2, 'always', 100],

    // Minimum length of the subject
    'subject-min-length': [2, 'always', 3],

    // Maximum line length in body
    'body-max-line-length': [2, 'always', 100],

    // Maximum line length in footer
    'footer-max-line-length': [2, 'always', 100],
  },

  // Ignore certain commits
  ignores: [
    commit => commit.includes('WIP'),
    commit => commit.includes('wip'),
    commit => commit.includes('Merge'),
    commit => commit.includes('merge'),
  ],
};
