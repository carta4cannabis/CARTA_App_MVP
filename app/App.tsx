// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

// Adjust these import paths to match your project
import HomeScreen from './src/screens/HomeScreen';
import DosingEngine from './src/screens/DosingEngineScreen';
import SessionTracker from './src/screens/SessionTrackerScreen';
import Products from './src/screens/ProductsScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import EducationScreen from './src/screens/EducationScreen';
import HandoutViewerScreen from './src/screens/HandoutViewerScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import FindDispensaryScreen from './src/screens/FindScreen';
import MoreScreen from './src/screens/MoreScreen';

type RootStackParamList = {
  Tabs: undefined;
  ProductDetails: { id: string } | undefined;
  HandoutViewer: { title?: string; assetId?: number } | undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const colors = {
  bg: '#0E1412',
  card: '#112018',
  border: '#1F2C27',
  text: '#E9EFEA',
  sub: '#9FB0A8',
  gold: '#C9A86A',
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
  },
};

function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.sub,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingTop: 4,
          paddingBottom: 6,
          height: 62,
        },
        tabBarItemStyle: { justifyContent: 'center', alignItems: 'center' },
        tabBarLabelStyle: { textAlign: 'center', fontSize: 11, marginTop: -2 },
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home-outline',
            Dosing: 'medkit-outline',
            Tracker: 'pulse-outline',
            Products: 'bag-outline',
            Education: 'book-outline',
            Scanner: 'qr-code-outline',
            Find: 'location-outline',
            More: 'menu-outline',
          };
          const name = map[route.name] ?? 'ellipse-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dosing" component={DosingEngine} options={{ title: 'Dosing' }} />
      <Tab.Screen name="Tracker" component={SessionTracker} options={{ title: 'Tracker' }} />
      <Tab.Screen name="Products" component={Products} />
      <Tab.Screen name="Education" component={EducationScreen} />
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="Find" component={FindDispensaryScreen} options={{ title: 'Find' }} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          // removed: headerBackTitleVisible (not supported on native-stack)
        }}
      >
        <RootStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{ title: 'Product Details' }}
        />
        <RootStack.Screen
          name="HandoutViewer"
          component={HandoutViewerScreen}
          options={({ route }) => ({ title: route.params?.title ?? 'Handout' })}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}