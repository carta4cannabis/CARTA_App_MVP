
import React from 'react';
import { Text, View } from 'react-native';
import { useStyles, spacing } from '../styles/styles';

export function Chip({ label }: { label: string }) {
  const { t } = useStyles();
  return (
    <View style={{ borderColor: t.accent, borderWidth: 1, paddingVertical: 6, paddingHorizontal: spacing.sm, borderRadius: 999, marginRight: 8, marginBottom: 8 }}>
      <Text style={{ color: t.accent, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
