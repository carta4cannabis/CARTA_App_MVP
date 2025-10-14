// app/App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

// ---- Screen imports (keep your existing file paths) ----
import HomeScreen from './src/screens/HomeScreen';
import DosingEngineScreen from './src/screens/DosingEngineScreen';
import SessionTrackerScreen from './src/screens/SessionTrackerScreen';
import CoachScreen from './src/screens/CoachScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import EducationScreen from './src/screens/EducationScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import FindScreen from './src/screens/FindScreen';
import MoreScreen from './src/screens/MoreScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import HandoutViewerScreen from './src/screens/HandoutViewerScreen';
import SummaryPreviewScreen from './src/screens/SummaryPreviewScreen';


// ---- Navigation types (lightweight & non-breaking) ----
export type TabsParamList = {
  Home: undefined;
  Dosing: undefined;
  Tracker: undefined;
  Coach?: undefined;
  Products: undefined;
  Education: undefined;
  Scanner: undefined;
  Find: undefined;
  More: undefined;
  
};

export type RootStackParamList = {
  Tabs: undefined;
  ProductDetails: { id: string } | undefined;
  HandoutViewer: { title?: string; uri?: string } | undefined;
  SummaryPreview: undefined;
};

const GOLD = '#D4AF37';
const DEEP = '#0E1A16';

const Tab = createBottomTabNavigator<TabsParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// ---- Bottom tabs (unchanged screens; centered bar) ----
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: '#9AA5A1',
        tabBarStyle: {
          backgroundColor: DEEP,
          borderTopColor: '#26332D',
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
        },
        tabBarItemStyle: { alignSelf: 'center' },
        tabBarIcon: ({ color, size }) => {
          const name: keyof typeof Ionicons.glyphMap = (() => {
            switch (route.name) {
              case 'Home': return 'home-outline';
              case 'Dosing': return 'medkit-outline';
              case 'Tracker': return 'analytics-outline';
              case 'Coach': return 'chatbubbles-outline';
              case 'Products': return 'bag-outline';
              case 'Education': return 'book-outline';
              case 'Scanner': return 'qr-code-outline';
              case 'Find': return 'location-outline';
              case 'More': return 'menu-outline';
              default: return 'ellipse-outline';
            }
          })();
          return <Ionicons name={name} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dosing" component={DosingEngineScreen} />
      <Tab.Screen name="Tracker" component={SessionTrackerScreen} />
      <Tab.Screen name="Coach" component={CoachScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Education" component={EducationScreen} />
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="Find" component={FindScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
      {/* If you don't have CoachScreen yet, keep this line but leave the file stubbed. */}
      
    </Tab.Navigator>
  );
}

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: DEEP },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <RootStack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: DEEP },
            headerTintColor: GOLD,
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
          }}
        >
          <RootStack.Screen
            name="Tabs"
            component={Tabs}
            options={{ headerShown: false }}
          />
          {/* Modals / pushed screens (unchanged) */}
          <RootStack.Screen
            name="ProductDetails"
            component={ProductDetailsScreen}
            options={{ title: 'Product Details' }}
          />
          <RootStack.Screen
            name="SummaryPreview"
            component={SummaryPreviewScreen}
            options={{ title: 'Clinician Summary' }}
          />
          <RootStack.Screen
            name="HandoutViewer"
            component={HandoutViewerScreen}
            options={({ route }) => ({
              title: (route.params?.title ?? 'Handout') as string,
            })}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}