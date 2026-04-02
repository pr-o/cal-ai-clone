const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['node_modules/', 'drizzle/', '.expo/'],
  },
  {
    rules: {
      // React Native strings are not HTML — apostrophes in <Text> are valid
      'react/no-unescaped-entities': 'off',
    },
  },
]);
