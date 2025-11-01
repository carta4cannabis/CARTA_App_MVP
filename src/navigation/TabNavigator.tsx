// app/src/navigation/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import DosingEngineScreen from '../screens/DosingEngineScreen';
import ProductsScreen from '../screens/StoreScreen';
import EducationScreen from '../screens/EducationScreen';
import QuestScreen from '../addons/CARTA_QuestScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dosing" component={DosingEngineScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Education" component={EducationScreen} />
      <Tab.Screen name="Quest" component={QuestScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
