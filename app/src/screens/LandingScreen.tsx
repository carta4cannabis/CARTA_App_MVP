import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../components/Button';
import { C } from '../ui/theme';

const LandingScreen: React.FC<any> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 60 }}>
      <Text style={{ color: C.gold, fontSize: 30, fontWeight: '800', marginBottom: 6 }}>CARTA</Text>
      <Text style={{ color: C.text, fontSize: 24, fontWeight: '800' }}>Personalized Botanical Wellness</Text>
      <Text style={{ color: C.mute, marginTop: 8 }}>Thoughtfully formulated blends to help you feel your best.</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
        <Button title="Shop" onPress={() => navigation.navigate('Store')} />
        <Button title="Learn" tone="ghost" onPress={() => navigation.navigate('Education')} />
      </View>
    </View>
  );
};
export default LandingScreen;
