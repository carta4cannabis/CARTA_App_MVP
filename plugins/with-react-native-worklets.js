// plugins/with-react-native-worklets.js
const {
  withSettingsGradle,
  withAppBuildGradle,
} = require("@expo/config-plugins");

const WORKLETS_MODULE = "react-native-worklets";

module.exports = function withReactNativeWorklets(config) {
  // 1) make sure the module is included in settings.gradle
  config = withSettingsGradle(config, (config) => {
    const mod = config.modResults;

    const includeLine = `include ':${WORKLETS_MODULE}'`;
    const projectLine = `project(':${WORKLETS_MODULE}').projectDir = new File(rootProject.projectDir, '../node_modules/${WORKLETS_MODULE}/android')`;

    if (!mod.contents.includes(includeLine)) {
      mod.contents += `\n${includeLine}`;
    }
    if (!mod.contents.includes(projectLine)) {
      mod.contents += `\n${projectLine}`;
    }

    return config;
  });

  // 2) add dependency to android/app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    const mod = config.modResults;

    // avoid double-injecting
    if (
      !mod.contents.includes(
        `implementation project(':${WORKLETS_MODULE}')`
      )
    ) {
      // find the main dependencies block and inject a single line
      mod.contents = mod.contents.replace(
        /dependencies\s*{([\s\S]*?)}/,
        (match) => {
          // insert right after the opening brace
          return match.replace(
            "{",
            `{\n    implementation project(':${WORKLETS_MODULE}')`
          );
        }
      );
    }

    return config;
  });

  return config;
};
