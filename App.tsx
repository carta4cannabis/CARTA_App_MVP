import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import RootNavigation from './src/navigation/rootNavigation';
import { Text, TextInput, View, StyleSheet } from 'react-native';

// ---- Global font-scaling override (Text + TextInput) ----
const _Text = Text as any;
const _TextInput = TextInput as any;

if (_Text.defaultProps == null) {
  _Text.defaultProps = {};
}
if (_TextInput.defaultProps == null) {
  _TextInput.defaultProps = {};
}

_Text.defaultProps.allowFontScaling = false;
_TextInput.defaultProps.allowFontScaling = false;
// ---- end global font-scaling tweak ----

// Navigation theme (keeps your transparent background behavior)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function App() {
  return (
    <View style={styles.root}>
      <NavigationContainer theme={theme}>
        {/* This wrapper centers the app and caps width on iPads */}
        <View style={styles.page}>
          <View style={styles.pageInner}>
            <RootNavigation />
          </View>
        </View>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Matches your DEEP background so tablet side-margins look on-brand
    backgroundColor: '#0E1A16',
  },
  page: {
    flex: 1,
    alignItems: 'center',        // center horizontally on big screens
    justifyContent: 'flex-start',
  },
  pageInner: {
    flex: 1,
    width: '100%',
    maxWidth: 700,               // <- key line: cap content width on iPads
  },
});
