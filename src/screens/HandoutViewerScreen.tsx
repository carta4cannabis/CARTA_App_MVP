// app/src/screens/HandoutViewerScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';

type HandoutParams = {
  HandoutViewer: {
    title?: string;
    /** Preferred: direct file:// or http(s):// URI to the PDF/HTML */
    uri?: string | null;
    /** Legacy: bundled asset id (kept for backward compatibility) */
    assetId?: number;
  };
};

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';

export default function HandoutViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HandoutParams, 'HandoutViewer'>>();

  const [resolvedUri, setResolvedUri] = useState<string | null>(null);

  // Set the title if provided
  useEffect(() => {
    if (route.params?.title) {
      navigation.setOptions({ title: route.params.title });
    }
  }, [navigation, route.params?.title]);

  // Resolve a usable URI from either route.params.uri or route.params.assetId
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) If a direct URI was passed (ToolsHub path), prefer it
        if (route.params?.uri) {
          if (mounted) setResolvedUri(route.params.uri);
          return;
        }

        // 2) Back-compat: if an assetId was passed (older flows), resolve it
        if (route.params?.assetId != null) {
          const asset = Asset.fromModule(route.params.assetId);
          await asset.downloadAsync();
          if (mounted) setResolvedUri(asset.localUri ?? asset.uri);
          return;
        }

        // 3) Nothing to show
        if (mounted) setResolvedUri(null);
      } catch (e) {
        console.warn('HandoutViewer: failed to resolve URI', e);
        if (mounted) setResolvedUri(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [route.params?.uri, route.params?.assetId]);

  const webSource = useMemo(() => {
    if (!resolvedUri) return null;

    // For Android local files, make sure the URI is file://
    if (Platform.OS === 'android' && !/^https?:\/\//i.test(resolvedUri) && !/^file:\/\//i.test(resolvedUri)) {
      return { uri: `file://${resolvedUri}` };
    }
    return { uri: resolvedUri };
  }, [resolvedUri]);

  if (!webSource) {
    return (
      <View style={{ flex: 1, backgroundColor: DEEP, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={GOLD} />
      </View>
    );
  }

  return (
    <WebView
      style={{ flex: 1, backgroundColor: DEEP }}
      source={webSource}
      originWhitelist={['*']}
      allowingReadAccessToURL={'file:///'}
      allowFileAccess
      allowUniversalAccessFromFileURLs
      allowsBackForwardNavigationGestures
    />
  );
}
