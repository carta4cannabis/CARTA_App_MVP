import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ProductsHubScreen from '../screens/ProductsHubScreen';
import OutcomesHubScreen from '../screens/OutcomesHubScreen';
import ToolsHubScreen from '../screens/ToolsHubScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import SummaryPreviewScreen from '../screens/SummaryPreviewScreen';
import HandoutViewerScreen from '../screens/HandoutViewerScreen';

// NEW imports for profile/age gate + cultivar tools
import EntryScreen from '../screens/EntryScreen';
import AgeGateScreen from '../screens/AgeGateScreen';
import MyCultivarsScreen from '../screens/MyCultivarScreen';
import CultivarDetailScreen from '../screens/CultivarDetailScreen';
import CultivarProfileMatchingScreen from '../screens/CultivarProfileMatchingScreen';
import CohortViewScreen from '../screens/CohortViewScreen';
import { ProfileProvider } from '../context/ProfileContext';
import {
  getReliefMetricsForPdf,
  RELIEF_METRICS,
  RELIEF_METRIC_LABELS,
} from '../utils/reliefMetrics';

async function buildClinicianPdf() {
  const { series, summary } = await getReliefMetricsForPdf({
    maxDays: 30,
    maxEntries: 60,
  });

  // 1) Use `summary` at the top of the PDF:
  //    e.g. “Pain relief: 3.8 (n=14)”, etc.

  // 2) Feed `series` into your chart generator:
  //    each `series[key]` is an array of { x: Date, y: number } for one colored line.
}


const GOLD = '#C9A86A';
const DEEP = '#0E1A16';

export type RootStackParamList = {
  // New entry + age-gate flow
  Entry: undefined;
  AgeGate: { profileId: string; isGuest: boolean };

  // Existing routes
  Tabs: undefined;
  ProductsHubScreen: undefined;
  OutcomesHubScreen: undefined;
  ToolsHubScreen: undefined;
  ProductDetails: { productId?: string } | undefined;
  SummaryPreview: { html?: string; title?: string } | undefined;
  HandoutViewer: { title?: string; uri: string } | undefined;

  // New cultivar-related tools
  MyCultivars: undefined;
  CultivarDetail: { cultivarId: string };
  CultivarProfileMatching: undefined;
  CohortView: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  return (
    <ProfileProvider>
      <Stack.Navigator
        initialRouteName="Entry"
        screenOptions={{
          headerStyle: { backgroundColor: DEEP },
          headerTintColor: GOLD,
          headerTitleStyle: { color: GOLD, fontSize: 28, fontWeight: '700' },
          headerBackTitle: 'Back',
          headerBackButtonMenuEnabled: false,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: DEEP },
        }}
      >
        {/* New opening flow */}
        <Stack.Screen
          name="Entry"
          component={EntryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AgeGate"
          component={AgeGateScreen}
          options={{ headerShown: false }}
        />

        {/* Existing Tabs (unchanged) */}
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        {/* Hub landing pages (unchanged) */}
        <Stack.Screen
          name="ProductsHubScreen"
          component={ProductsHubScreen}
          options={{ title: 'Products & Education' }}
        />
        <Stack.Screen
          name="OutcomesHubScreen"
          component={OutcomesHubScreen}
          options={{ title: 'Outcomes' }}
        />
        <Stack.Screen
          name="ToolsHubScreen"
          component={ToolsHubScreen}
          options={{ title: 'Tools & Extras' }}
        />

        {/* Existing pushed screens (unchanged) */}
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{ title: 'Product Details' }}
        />
        <Stack.Screen
          name="SummaryPreview"
          component={SummaryPreviewScreen}
          options={{ title: 'Clinician Summary' }}
        />
        <Stack.Screen
          name="HandoutViewer"
          component={HandoutViewerScreen}
          options={({ route }) => ({
            title: (route.params?.title ?? 'Handout') as string,
          })}
        />

        {/* New cultivar tools */}
        <Stack.Screen
          name="MyCultivars"
          component={MyCultivarsScreen}
          options={{ title: 'My Cultivars' }}
        />
        <Stack.Screen
          name="CultivarDetail"
          component={CultivarDetailScreen}
          options={{ title: 'Cultivar Details' }}
        />
        <Stack.Screen
          name="CultivarProfileMatching"
          component={CultivarProfileMatchingScreen}
          options={{ title: 'Cultivar Profile Matching' }}
        />
        <Stack.Screen
          name="CohortView"
          component={CohortViewScreen}
          options={{ title: 'Cohort View' }}
        />
      </Stack.Navigator>
    </ProfileProvider>
  );
}
