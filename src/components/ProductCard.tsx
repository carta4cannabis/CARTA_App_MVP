import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Card } from './Card';
import { C } from '../ui/theme';

type Product = { id: string; name: string; subtitle?: string; price: string; image: any };

export const ProductCard: React.FC<{ item: Product; onPress?: () => void; }> = ({ item, onPress }) => {
  return (
    <Card style={{ overflow: 'hidden' }}>
      <Image source={item.image} style={{ width: '100%', height: 140, borderRadius: 12, marginBottom: 8 }} />
      <Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }}>{item.name}</Text>
      {!!item.subtitle && <Text style={{ color: C.mute, marginTop: 2 }}>{item.subtitle}</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <Text style={{ color: C.gold, fontWeight: '800', fontSize: 16 }}>{item.price}</Text>
        <Pressable onPress={onPress} style={({pressed})=>({ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: C.line, opacity: pressed ? 0.9 : 1 })}>
          <Text style={{ color: C.text, fontWeight: '700' }}>Details</Text>
        </Pressable>
      </View>
    </Card>
  );
};
