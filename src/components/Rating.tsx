
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { g } from '../styles/styles';

export function Rating({ value, onChange }:{ value:number; onChange:(v:number)=>void }) {
  return (
    <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
      <Text accessible accessibilityLabel={`Current rating ${value} of 5`} style={g.p}>Rating:</Text>
      {[1,2,3,4,5].map(n => (
        <Pressable key={n} onPress={()=>onChange(n)} accessibilityRole="button" accessibilityLabel={`Rate ${n} out of 5`} style={[g.button, { paddingVertical: 6, paddingHorizontal: 10, marginRight: 6, opacity: value===n?1:0.6 }]}>
          <Text style={g.buttonText}>{n}</Text>
        </Pressable>
      ))}
    </View>
  );
}
