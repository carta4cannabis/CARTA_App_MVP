
import React from 'react';
import { View, Text } from 'react-native';
import { useStyles, spacing } from '../styles/styles';

export function Section({ title, children }: { title: string; children: any }) {
  const { g, t } = useStyles();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={g.h2}>{title}</Text>
      <View style={{ height: 6 }} />
      <View style={{ borderBottomWidth: 1, borderColor: t.border, marginBottom: spacing.sm }} />
      {children}
    </View>
  );
}
