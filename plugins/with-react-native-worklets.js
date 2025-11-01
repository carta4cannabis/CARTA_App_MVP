// plugins/with-react-native-worklets.js
// Purpose:
// 1) make sure the native project knows about :react-native-worklets
// 2) force-add the Google ML Kit barcode dependency so expo-barcode-scanner can compile

const {
  withPlugins,
  withAppBuildGradle,
  withSettingsGradle,
  createRunOncePlugin,
} = require("@expo/config-plugins");

// try to read version so Expo's "run once" works nicely
let pkgName = "react-native-worklets";
let pkgVersion = "0.6.1";
try {
  const pkg = require("react-native-worklets/package.json");
  pkgName = pkg.name || pkgName;
  pkgVersion = pkg.version || pkgVersion;
} catch (e) {
  // keep defaults
}

function ensureSettingsGradle(config) {
  return withSettingsGradle(config, (config) => {
    let contents = config.modResults.contents;
    // add the include only if it's not already there
    if (!contents.includes("react-native-worklets")) {
      contents += `
include ':react-native-worklets'
project(':react-native-worklets').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-worklets/android')
`;
      config.modResults.contents = contents;
    }
    return config;
  });
}

function ensureAppBuildGradle(config) {
  return withAppBuildGradle(config, (config) => {
    let gradle = config.modResults.contents;

    // helper to inject into dependencies { ... }
    const addDep = (src, depLine) => {
      if (src.includes(depLine)) return src;
      return src.replace(/dependencies\s*{/, (match) => `${match}\n    ${depLine}`);
    };

    // 1) make sure worklets is there
    gradle = addDep(gradle, "implementation project(':react-native-worklets')");

    // 2) make sure ML Kit barcode is there (version is stable enough for 2025 Expo builds)
    // if you ever get a "cannot find 17.3.0" error, bump this to the latest from Maven
    gradle = addDep(gradle, "implementation 'com.google.mlkit:barcode-scanning:17.3.0'");

    config.modResults.contents = gradle;
    return config;
  });
}

function withWorkletsAndMLKit(config) {
  return withPlugins(config, [ensureSettingsGradle, ensureAppBuildGradle]);
}

module.exports = createRunOncePlugin(
  withWorkletsAndMLKit,
  "with-react-native-worklets",
  pkgVersion
);
