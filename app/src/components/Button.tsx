import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import { C } from '../ui/theme';

type Props = { title: string; onPress: () => void; style?: ViewStyle; tone?: 'primary'|'ghost' };

export const Button: React.FC<Props> = ({ title, onPress, style, tone='primary' }) => {
  const bg = tone === 'primary' ? C.gold : 'transparent';
  const color = tone === 'primary' ? '#10231D' : C.text;
  const border = tone === 'primary' ? 'transparent' : C.line;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        backgroundColor: bg,
        paddingVertical: 14, paddingHorizontal: 18,
        borderRadius: C.r.pill,
        borderWidth: 1, borderColor: border,
        opacity: pressed ? 0.9 : 1, alignItems: 'center', justifyContent: 'center'
      }, style]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={{ color, fontWeight: '700', fontSize: 15 }}>{title}</Text>
    </Pressable>
  );
};
