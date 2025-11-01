import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { styles, theme } from '../theme/styles';
import { DeliveryPreference, GoalType, ProtocolPlan, ProtocolDay } from '../types';
import { savePlan } from '../services/aiCoach';

const SKUS = {
  sleep: { capsule: 'Rest & Restore', spray: 'Booster Spray (Night)' },
  focus: { capsule: 'Calm & Focus', spray: 'Booster Spray (Day)' },
  calm:  { capsule: 'Calm & Focus', spray: 'Booster Spray (Day)' },
  recovery: { capsule: 'Mobility & Function', spray: 'Stacker Spray' },
  mood: { capsule: 'Mood & Uplift', spray: 'Booster Spray (Day)' },
};

export default function GoalBuilderScreen({ navigation }: any) {
  const [goal, setGoal] = useState<GoalType>('focus');
  const [duration, setDuration] = useState<7 | 14 | 30>(14);
  const [delivery, setDelivery] = useState<DeliveryPreference>('both');
  const [note, setNote] = useState('');

  const buildDays = (): ProtocolDay[] => {
    const sku = SKUS[goal];
    const days: ProtocolDay[] = [];
    for (let i = 0; i < duration; i++) {
      const day: ProtocolDay = { dayIndex: i, notes: note || undefined };
      if (delivery === 'capsules' || delivery === 'both') {
        day.morning = { sku: sku.capsule, dose: '1 cap' };
        if (goal === 'focus' || goal === 'mood' || goal === 'calm') {
          day.midday = { sku: sku.capsule, dose: '1 cap' };
        }
        day.evening = (goal === 'sleep' || goal === 'recovery')
          ? { sku: sku.capsule, dose: '1 cap' }
          : day.evening;
      }
      if (delivery === 'sprays' || delivery === 'both') {
        if (goal !== 'sleep') {
          day.midday = { ...(day.midday || { sku: sku.spray, dose: '2 sprays' }), sku: sku.spray, dose: '2 sprays' };
        } else {
          day.evening = { ...(day.evening || { sku: sku.spray, dose: '2 sprays' }), sku: sku.spray, dose: '2 sprays' };
        }
      }
      days.push(day);
    }
    return days;
  };

  const createPlan = async () => {
    const plan: ProtocolPlan = {
      id: String(Date.now()),
      goal, durationDays: duration, delivery,
      createdAt: Date.now(),
      days: buildDays(),
    };
    await savePlan(plan);
    Alert.alert('Protocol Saved', 'Your plan has been created. The Coach will now adapt to it.', [
      { text: 'Open Coach', onPress: () => navigation.navigate('Coach') },
      { text: 'OK' },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Goal-Driven Protocol Builder</Text>
      <Text style={styles.subtitle}>Create a 7/14/30-day plan the Coach can optimize</Text>

      <View style={styles.card}>
        <Text style={{ color: theme.colors.subtext, marginBottom: 8 }}>Select Goal</Text>
        <View style={styles.row}>
          {(['sleep','focus','calm','recovery','mood'] as GoalType[]).map(g => (
            <TouchableOpacity key={g} onPress={() => setGoal(g)} style={[styles.badge, { marginRight: 8, backgroundColor: goal===g ? '#232826' : '#1C2020' }]}>
              <Text style={styles.badgeText}>{g.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 12 }} />

        <Text style={{ color: theme.colors.subtext, marginBottom: 8 }}>Duration</Text>
        <View style={styles.row}>
          {[7,14,30].map(d => (
            <TouchableOpacity key={d} onPress={() => setDuration(d as any)} style={[styles.badge, { marginRight: 8, backgroundColor: duration===d ? '#232826' : '#1C2020' }]}>
              <Text style={styles.badgeText}>{d} Days</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 12 }} />

        <Text style={{ color: theme.colors.subtext, marginBottom: 8 }}>Delivery Preference</Text>
        <View style={styles.row}>
          {(['capsules','sprays','both'] as DeliveryPreference[]).map(d => (
            <TouchableOpacity key={d} onPress={() => setDelivery(d)} style={[styles.badge, { marginRight: 8, backgroundColor: delivery===d ? '#232826' : '#1C2020' }]}>
              <Text style={styles.badgeText}>{d.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 12 }} />

        <Text style={{ color: theme.colors.subtext, marginBottom: 8 }}>Notes (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Avoid daytime sedation; prefer morning focus"
          placeholderTextColor="#777"
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity style={styles.button} onPress={createPlan}>
          <Text style={styles.buttonText}>Create Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}