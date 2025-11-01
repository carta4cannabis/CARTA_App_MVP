// plugins/with-react-native-worklets.js
const {
  withSettingsGradle,
  withAppBuildGradle,
  createRunOncePlugin,
} = require('@expo/config-plugins');

// we'll read the version from the actual package if it's there
let pkg = { name: 'react-native-worklets', version: '0.0.0' };
try {
  // this will exist on EAS after `npm ci`
  pkg = require('react-native-worklets/package.json');
} catch (e) {
  // ignore – we'll still inject the gradle lines
}

function addWorkletsToSettingsGradle(mod) {
  const already =
    mod.contents.includes("react-native-worklets") ||
    mod.contents.includes(":react-native-worklets");

  if (!already) {
    mod.contents += `
include ':react-native-worklets'
project(':react-native-worklets').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-worklets/android')
`;
  }

  return mod;
}

function addWorkletsToAppBuildGradle(mod) {
  const already = mod.contents.includes("react-native-worklets");
  if (already) return mod;

  // try to inject into the dependencies block
  mod.contents = mod.contents.replace(
    /dependencies\s*{([\s\S]*?)}/m,
    (match) => {
      if (match.includes("implementation project(':react-native-worklets')")) {
        return match; // already there
      }
      return match.replace(
        /}\s*$/m,
        "    implementation project(':react-native-worklets')\n}\n"
      );
    }
  );

  return mod;
}

const withReactNativeWorklets = (config) => {
  // add to settings.gradle
  config = withSettingsGradle(config, (cfg) => {
    cfg.modResults = addWorkletsToSettingsGradle(cfg.modResults);
    return cfg;
  });

  // add to android/app/build.gradle
  config = withAppBuildGradle(config, (cfg) => {
    cfg.modResults = addWorkletsToAppBuildGradle(cfg.modResults);
    return cfg;
  });

  return config;
};

module.exports = createRunOncePlugin(
  withReactNativeWorklets,
  pkg.name,
  pkg.version
);
