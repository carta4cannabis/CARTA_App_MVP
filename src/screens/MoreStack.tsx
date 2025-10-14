// src/screens/MoreStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from './MoreScreen'; // <- file below (or your own More screen)

type MoreStackParamList = {
  MoreHome: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#112018' },
        headerTintColor: '#E9EFEA',
      }}
    >
      <Stack.Screen
        name="MoreHome"
        component={MoreScreen}
        options={{ title: 'More' }}
      />
    </Stack.Navigator>
  );
}
