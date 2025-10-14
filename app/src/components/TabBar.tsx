
import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStyles, spacing } from '../styles/styles';

const items = [
  { key: 'Scan', label: 'Scan' },
  { key: 'Store', label: 'Store' },
  { key: 'Log', label: 'Log' },
  { key: 'Retailers', label: 'Retailers' }
];

export const TabBar: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute();
  const { t } = useStyles();
  return (
    <View style={{ position:'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg, backgroundColor: t.card, borderRadius: 16, borderColor: t.border, borderWidth: 1, flexDirection:'row', justifyContent:'space-around', paddingVertical: 10 }}>
      {items.map(it => {
        const active = (route.name === it.key);
        return (
          <Pressable key={it.key} onPress={()=>nav.navigate(it.key as never)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: active ? t.accent : 'transparent' }}>
            <Text style={{ color: active ? '#fff' : t.text, fontWeight:'700' }}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
