module.exports = {
  root: true,
  extends: ['@infocus/eslint-config/base'],
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    '.turbo',
    '.next',
    'coverage',
    '*.config.js',
    '*.config.cjs',
    '*.config.ts',
  ],
};
