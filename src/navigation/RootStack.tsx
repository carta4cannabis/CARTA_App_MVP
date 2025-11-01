// app/src/navigation/RootStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ScanScreen from '../screens/scan';
import FindDispensaryScreen from '../screens/FindDispensary';

export type RootStackParamList = {
  Tabs: undefined;
  Scan: undefined;
  FindDispensary: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan' }} />
      <Stack.Screen name="FindDispensary" component={FindDispensaryScreen} options={{ title: 'Find Dispensary' }} />
    </Stack.Navigator>
  );
}
