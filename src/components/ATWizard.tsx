// @ts-nocheck
// app/src/components/ATIWizard.tsx
import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  initialValues?: any;
  onRefresh?: () => void;
};

/**
 * Minimal shim so the screen compiles and runs.
 * Keep/replace with your full wizard UI as you had it before.
 */
export default function ATIWizard({ initialValues }: Props) {
  return (
    <View>
      <Text style={{ color: '#E9EFEA', fontWeight: '700', fontSize: 16, marginBottom: 8 }}>
        ATI Wizard
      </Text>
      <Text style={{ color: '#9FB0A5' }}>
        Initial values loaded for ATI.
      </Text>
    </View>
  );
}
