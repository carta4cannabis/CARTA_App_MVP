import React, { memo } from 'react';
import {
  ImageBackground,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const GOLD = '#C9A86A';
const DEEP = '#0E1A16';
const CARD = '#121F1A';

type TabsParamList = {
  Home: undefined;
  Dosing: undefined;
  Tracker: undefined;
  Coach: undefined;
  Products: undefined;
  Education: undefined;
  Scanner: undefined;
  Find: undefined;
  More: undefined;

};

type Nav = NavigationProp<any>;

export default memo(function HomeScreen() {
  const navigation = useNavigation<Nav>();

  // Works whether Home is inside Tabs or a parent stack
  const go = (tabName: keyof TabsParamList | string) => {
    const parent = navigation.getParent();
    const parentState = parent?.getState?.();
    if (parentState && parentState.routeNames?.includes('Tabs')) {
      parent?.navigate('Tabs', { screen: tabName });
    } else {
      navigation.navigate(tabName);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Poster background */}
      <ImageBackground
        source={require('../../assets/poster/carta_poster.png')}
        resizeMode="cover"
        style={s.bg}
      >
        {/* Brand lockup over poster */}
        <View style={s.brandWrap}>
          /
          <Text style={s.brandSub}>Charting the path to tailored cannabis</Text>
        </View>
        {/* Card with actions (bottom overlay) */}
        <View style={s.card}>
          <View style={s.row}>
            <Action label="Dosing Engine" onPress={() => go('Dosing')} />
            <Action label="Session Tracker" onPress={() => go('Tracker')} />
          </View>
          <View style={s.row}>
            <Action label="Products" onPress={() => go('Products')} />
            <Action label="Coach" onPress={() => go('Coach')} />
          </View>
          <View style={s.row}>
            <Action label="Scan a Product" onPress={() => go('Scanner')} />
            <Action label="Education" onPress={() => go('Education')} />
          </View>
          <View style={s.row}>
            <Action label="Find a Dispensary" onPress={() => go('Find')} />
            <Action label="More" onPress={() => go('More')} />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
});

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [s.btn, pressed && s.pressed]} onPress={onPress}>
      <Text style={s.btnText}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DEEP },
  bg: { flex: 1, justifyContent: 'flex-end' },
  brandWrap: {
    alignItems: 'center',
    paddingTop: 24,
  },
  brandMark: { width: 76, height: 76, marginBottom: 8 },
  brand: {
    color: GOLD,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
  },
  brandSub: {
    color: GOLD,
    fontSize: 18,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 8,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: GOLD,
    margin: 2,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1C2B24',
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
  },
  pressed: { opacity: 0.75 },
  btnText: {
    color: '#E9EFEA',
    fontWeight: '600',
    fontSize: 15,
  },
});