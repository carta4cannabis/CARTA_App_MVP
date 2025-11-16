// react-native.config.js
/** @type {import('@react-native-community/cli-types').Config} */
module.exports = {
  dependencies: {
    'react-native-worklets': {
      platforms: {
        android: null,
        ios: {
        podspecPath: './node_modules/react-native-worklets/RNWorklets.podspec',}
      },
    },
  },
};
