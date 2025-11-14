import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import RootNavigation from './src/navigation/rootNavigation';
import { rootNavRef, flushPendingNavigations } from './src/navigation/navRef';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent' },
};

export default function App() {
  return (
    <NavigationContainer
      ref={rootNavRef}
      onReady={flushPendingNavigations}
      theme={theme}
    >
      <RootNavigation />
    </NavigationContainer>
  );
}
