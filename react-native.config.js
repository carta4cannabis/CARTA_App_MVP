// react-native.config.js
const path = require('path');

/** @type {import('@react-native-community/cli-types').Config} */
module.exports = {
  dependencies: {
    'react-native-worklets': {
      platforms: {
        ios: {
          podspecPath: './node_modules/react-native-worklets/RNWorklets.podspec',
          root: path.resolve(
            __dirname,
            'node_modules/react-native-worklets-core'
          ),
        },
        // NOTE: no "android: null" here – Android should autolink normally
      },
    },
  },
};
