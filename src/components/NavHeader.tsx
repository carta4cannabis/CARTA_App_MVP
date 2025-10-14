import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { C } from '../ui/theme';

type Props = { title: string; right?: React.ReactNode };

export const NavHeader: React.FC<Props> = ({ title, right }) => {
  const nav = useNavigation<any>();
  const goBackOrHome = () => (nav.canGoBack() ? nav.goBack() : nav.navigate('Home'));

  return (
    <View style={{
      paddingTop: 14, paddingBottom: 14, paddingHorizontal: 16,
      borderBottomWidth: 1, borderBottomColor: C.line,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: C.bg
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={goBackOrHome} style={({pressed})=>({ opacity: pressed ? 0.8 : 1 })}>
          <Text style={{ color: C.text, fontWeight: '800' }}>{nav.canGoBack() ? 'Back' : 'Home'}</Text>
        </Pressable>
        <Pressable onPress={()=> nav.navigate('Home')} style={({pressed})=>({ opacity: pressed ? 0.8 : 1 })}>
          <Text style={{ color: C.mute, fontWeight: '700' }}>Home</Text>
        </Pressable>
      </View>

      <Text style={{ color: C.text, fontSize: 18, fontWeight: '800' }} numberOfLines={1}>
        {title}
      </Text>

      <View style={{ width: 50, alignItems: 'flex-end' }}>
        {right ?? null}
      </View>
    </View>
  );
};
