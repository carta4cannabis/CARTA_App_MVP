// app/src/screens/HandoutViewerScreen.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';

type ParamList = { HandoutViewer: { title: string; assetId: number } };

export default function HandoutViewerScreen() {
  const route = useRoute<RouteProp<ParamList, 'HandoutViewer'>>();
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const a = Asset.fromModule(route.params.assetId);
        await a.downloadAsync();
        if (mounted) setUri(a.localUri ?? a.uri);
      } catch (e) {
        console.warn('Failed to load asset', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [route.params.assetId]);

  if (!uri) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F1B17' }}>
        <ActivityIndicator color="#C9A86A" />
      </View>
    );
    }
  return <WebView originWhitelist={['*']} source={{ uri }} style={{ flex: 1 }} />;
}
