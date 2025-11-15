import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const BG = require('../../assets/bg/carta_pattern.png');
const HEADLINE_SERIF =
  Platform.select({ ios: 'Palatino', android: 'serif' }) || 'serif';
import {
  initQuestDb,
  loadQuests,
  loadProgress,
  completeTask,
} from './quests';

const COLORS = {
  text: '#EAEAEA',
  sub: '#C9C9C9',
  GOLD: '#C9A86A',
  card: '#121616',
  accent: '#83C5BE',
  DEEP: '#0E1A16',
  CARD: '#121F1A',
  TEXT: '#E9EFEA',
  MUTED: '#9FB3A8',
};
const GOLD = '#C9A86A';
const Card = (p: any) => (
  <View
    style={{
      backgroundColor: COLORS.CARD,
      borderWidth: 1,
      borderColor: COLORS.GOLD,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    }}
    {...p}
  />
);

function BackHeader({ title }: { title: string }) {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        st.headerWrap,
        { paddingTop: insets.top - 26 },
      ]}
    >
      <Pressable
        onPress={() => nav.goBack()}
        style={({ pressed }) => [
          st.backBtn,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={st.backText}>{'\u25C0'}</Text>
        <Text style={st.backLabel}>Back</Text>
      </Pressable>
      <Text style={st.title}>{title}</Text>
    </View>
  );
}

export default function CARTA_QuestScreen() {
  const [quests, setQuests] = useState<any[]>([]);
  const [kp, setKp] = useState<number>(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await initQuestDb();
        await refresh();
      } catch (e: any) {
        setError(
          e?.message || 'Quest data failed to load.',
        );
      }
    })();
  }, []);

  async function refresh() {
    try {
      const q = await loadQuests();
      const p = await loadProgress();
      setQuests(q);
      setKp(p.kp);
      setBadges(p.badges);
      setError(null);
    } catch (e: any) {
      setError(
        e?.message || 'Quest data failed to load.',
      );
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.DEEP }}
    >
      {/* Background */}
      <ImageBackground
        source={BG}
        style={StyleSheet.absoluteFillObject}
        resizeMode={
          Platform.OS === 'ios' ? 'repeat' : 'cover'
        }
        imageStyle={{
          opacity: 0.5,
          resizeMode:
            Platform.OS === 'ios'
              ? 'repeat'
              : 'cover',
        }}
      />

      <BackHeader title="CARTA Quest" />

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 24,
        }}
      >
        <Text
          style={{ color: COLORS.TEXT, marginTop: 16, marginBottom: 14, fontSize: 15 }}>
          CARTA Quest turns learning into action. Each day you’ll get small, clinician-guided challenges — read a quick lesson, try a dosing tip, log a check-in, or practice a recovery habit. 
         </Text>
         <Text style={{ color: COLORS.TEXT, marginBottom: 40, fontSize: 15 }} >
          Complete quests to build streaks, earn badges, and unlock deeper guidance tailored by your Adaptive Therapeutic Index (ATI). The more consistently you engage, the smarter your recommendations become — helping you refine AM/PM/Bedtime routines, understand what works for your body, and turn insights into steady, real-world results.
        </Text>

        <Card
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={{
                color: COLORS.text,
                fontWeight: '700',
              }}
            >
              Knowledge Points
            </Text>
            <Text
              style={{
                color: COLORS.accent,
                marginBottom: 20,
                fontSize: 28,
                fontWeight: '800',
              }}
            >
              {kp}
            </Text>
          </View>
          <View>
            <Text
              style={{
                color: COLORS.text,
                fontWeight: '700',
              }}
            >
              Badges
            </Text>
            <Text style={{ color: COLORS.sub }}>
              {badges.join(', ') || '—'}
            </Text>
          </View>
        </Card>

        {error && (
          <Card>
            <Text
              style={{
                color: COLORS.text,
                marginBottom: 8,
              }}
            >
              Couldn’t load quests. Showing starter set.
            </Text>
          </Card>
        )}

        {(quests?.length
          ? quests
          : [
              {
                id: 'seed-q1',
                title: 'Entourage Explorer I',
                description:
                  'Learn chemotype basics and log your first session.',
                tasks: [
                  {
                    id: 'seed-t1',
                    label:
                      'Read: What is a chemotype?',
                    completed: false,
                  },
                  {
                    id: 'seed-t2',
                    label: 'Log 1 dosing session',
                    completed: false,
                  },
                ],
                rewardKP: 50,
                badge: 'Explorer I',
              },
            ]
        ).map((q: any) => {
          const done = q.tasks.every(
            (t: any) => t.completed,
          );
          return (
            <Card key={q.id}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    color: COLORS.GOLD,
                    fontWeight: '800',
                    fontSize: 18,
                  }}
                >
                  {q.title}
                </Text>
                {done && (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: COLORS.GOLD,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.GOLD,
                        fontWeight: '800',
                        fontSize: 12,
                      }}
                    >
                      Completed
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  color: COLORS.TEXT,
                  marginTop: 6,
                }}
              >
                {q.description}
              </Text>
              <View style={{ marginTop: 8 }}>
                {q.tasks.map((t: any) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={async () => {
                      if (!q.id.startsWith('seed-')) {
                        await completeTask(
                          q.id,
                          t.id,
                        );
                        await refresh();
                      } else {
                        t.completed = !t.completed;
                        setQuests([...quests]);
                      }
                    }}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text
                      style={{
                        color: t.completed
                          ? '#6ECB63'
                          : COLORS.text,
                      }}
                    >
                      {t.completed ? '✓ ' : '○ '}
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomColor: '#233229',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(18, 31, 26, 0.9)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  backText: { color: GOLD, fontWeight: '800', fontFamily: HEADLINE_SERIF, fontSize: 14, marginRight: 4 },
 backIcon: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, 
    fontSize: 14,
    marginRight: 4,
    marginBottom: 8,
  },
   backLabel: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 15,
    fontWeight: '500',
    marginBottom: -4,
  },

  title: {
    color: GOLD,
    fontFamily: HEADLINE_SERIF, fontSize: 32,
    fontWeight: '800',
    textAlign: 'center'
  },
});