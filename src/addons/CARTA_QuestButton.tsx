import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function QuestButton({ routeName = 'Quest' }: { routeName?: string }) {
  const navigation = useNavigation<any>();
  return (
    <View style={{ marginVertical: 12 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate(routeName)}
        style={{ backgroundColor: '#C7A44A', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
      >
        <Text style={{ color: '#111', fontWeight: '800' }}>Open CARTA Quest</Text>
      </TouchableOpacity>
    </View>
  );
}
