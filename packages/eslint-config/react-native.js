const reactConfig = require('./react');

module.exports = {
  ...reactConfig,
  plugins: [...new Set([...reactConfig.plugins, 'react-native'])],
  extends: [...reactConfig.extends, 'plugin:react-native/all'],
  env: {
    ...reactConfig.env,
    'react-native/react-native': true,
  },
  rules: {
    ...reactConfig.rules,
    'react-native/no-inline-styles': 'off',
    'react-native/no-raw-text': 'off',
  },
};
