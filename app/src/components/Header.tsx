
import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStyles, spacing } from '../styles/styles';

export function AppHeader({ title }: { title: string }) {
  const { t } = useStyles();
  return (
    <LinearGradient colors={t.gradient} start={{x:0,y:0}} end={{x:1,y:1}} style={{ borderRadius: 16, padding: spacing.lg, marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={require('../assets/icon.png')} style={{ width: 40, height: 40, borderRadius: 8, marginRight: spacing.md }} />
        <View>
          <Text style={{ color:'#CFF7EE', fontSize: 12, marginBottom: 2, opacity: 0.9 }}>CARTA</Text>
          <Text style={{ color:'#FFFFFF', fontSize: 20, fontWeight: '800' }}>{title}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
