import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Visible tabs
import HomeScreen from '../screens/HomeScreen';
import DosingEngineScreen from '../screens/DosingEngineScreen';
import SessionTrackerScreen from '../screens/SessionTrackerScreen';
import CoachScreen from '../screens/CoachScreen';
import ProductsScreen from '../screens/ProductsScreen';
import EducationScreen from '../screens/EducationScreen';
import CARTA_QuestScreen from '../addons/CARTA_QuestScreen';

// Routes we still need but do not want visible on the bar
import ScannerScreen from '../screens/ScannerScreen';
import FindScreen from '../screens/FindScreen';
import MoreScreen from '../screens/MoreScreen';

// Hub landing pages — keep the bottom bar visible by registering as hidden tabs
import OutcomesHubScreen from '../screens/OutcomesHubScreen';
import ProductsHubScreen from '../screens/ProductsHubScreen';
import ToolsHubScreen from '../screens/ToolsHubScreen';

const GOLD = '#C9A86A';
const CARD = '#121F1A';
const INACTIVE = '#8FA39A';

export type TabsParamList = {
  Home: undefined;
  Dosing: undefined;
  Tracker: undefined;
  Coach: undefined;
  Products: undefined;
  Education: undefined;
  Quest: undefined;

  // Scanner is now a visible tab again
  Scanner: undefined;

  // hidden but routable
  Find: undefined;
  More: undefined;

  // hubs as hidden tabs so bar stays visible on those pages
  OutcomesHub: undefined;
  ProductsHub: undefined;
  ToolsHub: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: CARD,
          borderTopColor: '#2A3A33',
          borderTopWidth: 1,
          paddingTop: 4,
          paddingHorizontal: 8,
        },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 4, marginTop: 4 },
        tabBarIcon: ({ focused, color, size }) => {
          const name = iconFor(route.name as keyof TabsParamList, focused);
          return <Ionicons name={name as any} size={size ?? 22} color={color} />;
        },
      })}
    >
      {/* *** VISIBLE TABS *** */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Dosing"
        component={DosingEngineScreen}
        options={{ title: 'Dosing' }}
      />
      <Tab.Screen name="Tracker" component={SessionTrackerScreen} />
      <Tab.Screen name="Coach" component={CoachScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Education" component={EducationScreen} />
      <Tab.Screen name="Quest" component={CARTA_QuestScreen} />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{ title: 'Scan' }}
      />

      {/* *** HIDDEN TABS (routable, not shown on bar) *** */}
      <Tab.Screen
        name="Find"
        component={FindScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />

      {/* Hubs as hidden tabs so the tab bar remains visible on them */}
      <Tab.Screen
        name="OutcomesHub"
        component={OutcomesHubScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tab.Screen
        name="ProductsHub"
        component={ProductsHubScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tab.Screen
        name="ToolsHub"
        component={ToolsHubScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
    </Tab.Navigator>
  );
}

function iconFor(route: keyof TabsParamList, focused: boolean) {
  switch (route) {
    case 'Home': return focused ? 'home' : 'home-outline';
    case 'Dosing': return 'medkit-outline';
    case 'Tracker': return 'analytics-outline';
    case 'Coach': return focused ? 'chatbubbles' : 'chatbubbles-outline';
    case 'Products': return focused ? 'bag' : 'bag-outline';
    case 'Education': return focused ? 'book' : 'book-outline';
    case 'Quest': return focused ? 'trophy' : 'trophy-outline';
    case 'Scanner': return 'qr-code';
    case 'Find': return 'location-outline';
    case 'More': return focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-circle-outline';
    case 'OutcomesHub': return 'clipboard-outline';
    case 'ProductsHub': return 'layers-outline';
    case 'ToolsHub': return 'construct-outline';
    default: return 'ellipse-outline';
  }
}
