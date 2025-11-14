import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// ✅ Screen components
import HomeScreen from '../HomeScreen';
import CARTA_QuestScreen from '../addons/CARTA_QuestScreen';

const Tab = createBottomTabNavigator();

export default function TabBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let name: any = 'ellipse';
          if (route.name === 'Home')  name = focused ? 'home' : 'home-outline';
          if (route.name === 'Quest') name = focused ? 'compass' : 'compass-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />

      {/* ❌ Removed Scan and Find tabs intentionally */}

      <Tab.Screen
        name="Quest"
        component={CARTA_QuestScreen}
        options={{
          title: 'CARTA Quest',
          headerShown: true,
        }}
      />

      {/* Keep any other existing tabs you use here (Dosing, Tracker, Coach, Products, Education, More, etc.) */}
    </Tab.Navigator>
  );
}
