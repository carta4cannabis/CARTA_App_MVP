import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function QuestLink({ href = '/quest' }: { href?: string }) {
  const router = useRouter();
  return (
    <View style={{ marginVertical: 12 }}>
      <TouchableOpacity
        onPress={() => router.push(href)}
        style={{ backgroundColor: '#C7A44A', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
      >
        <Text style={{ color: '#111', fontWeight: '800' }}>Open CARTA Quest</Text>
      </TouchableOpacity>
    </View>
  );
}
