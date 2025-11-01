// app/src/components/CameraPermissionGate.tsx
import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useCameraPermissions, PermissionStatus } from 'expo-camera';

type GateProps = { children: React.ReactNode };

const COLORS = {
  gold: '#C9A86A',
  deep: '#0E1A16',
  ink: '#E9EFEA',
  sub: '#9FB0A5',
};

export default function CameraPermissionGate({ children }: GateProps) {
  const [permission, requestPermission] = useCameraPermissions();

  // Permission object is still loading
  if (!permission) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12, color: COLORS.sub }}>
          Checking camera permission…
        </Text>
      </View>
    );
  }

  // Not granted yet → ask
  if (permission.status !== PermissionStatus.GRANTED) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text
          style={{
            marginBottom: 12,
            textAlign: 'center',
            color: COLORS.ink,
          }}
        >
          We need access to your camera to scan barcodes.
        </Text>

        <Pressable
          onPress={requestPermission}
          style={{
            backgroundColor: COLORS.gold,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: COLORS.deep, fontWeight: '700' }}>
            Allow Camera
          </Text>
        </Pressable>
      </View>
    );
  }

  // Permission granted → render children
  return <>{children}</>;
}
