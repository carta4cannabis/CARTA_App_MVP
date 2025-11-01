// app/src/addons/CARTA_CoachExtras.tsx
// one file that exports BOTH the UI and the helper functions

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initEnhanceDb,
  saveEMA,
  loadEMAs,
  loadPlan,
  generateCoachHints,
  savePlan,
} from './coachEnhance';
import type { EMACheckin, CoachHint, ProtocolPlan } from './types';

const COLORS = {
  text: '#E9EFEA',
  sub: '#C9C9C9',
  gold: '#C9A86A',
  card: '#121F1A',
  border: '#2A2F2F',
  accent: '#83C5BE',
};

// keys used by coach screen
const ATI_KEYS = {
  CHECKINS: '@carta:ati:checkins',
  ATI_INPUTS: '@carta:ati:inputs',
};

const Card = (p: any) => (
  <View
    style={{
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.gold,
      borderRadius: 12,
      padding: 16,
      marginTop: 14,
    }}
    {...p}
  />
);

function CoachExtras({ onSaved }: { onSaved?: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [hints, setHints] = useState<CoachHint[]>([]);
  const [plan, setPlan] = useState<ProtocolPlan | null>(null);

  const [energy, setEnergy] = useState('');
  const [mood, setMood] = useState('');
  const [pain, setPain] = useState('');
  const [sleep, setSleep] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    try {
      initEnhanceDb();
      setEnabled(true);
      refreshLocal();
    } catch {
      setEnabled(false);
    }
  }, []);

  function refreshLocal() {
    const p = loadPlan();
    const logs = loadEMAs();
    setPlan(p);
    setHints(generateCoachHints(p, logs));
  }

  async function submit() {
    const entry: EMACheckin = {
      timestamp: Date.now(),
      energy: energy ? parseInt(energy, 10) : undefined,
      mood: mood ? parseInt(mood, 10) : undefined,
      pain: pain ? parseInt(pain, 10) : undefined,
      sleep: sleep ? parseInt(sleep, 10) : undefined,
      note: note || undefined,
    };
    saveEMA(entry);

    await saveAtiCheckin(entry);
    await refreshAtiAndCoach();

    setEnergy('');
    setMood('');
    setPain('');
    setSleep('');
    setNote('');

    refreshLocal();
    if (onSaved) onSaved();
  }

  function mkStarterPlan() {
    const newPlan: ProtocolPlan = {
      id: String(Date.now()),
      goal: 'focus',
      durationDays: 14,
      createdAt: Date.now(),
      delivery: 'both',
      days: Array.from({ length: 14 }).map((_, i) => ({
        dayIndex: i,
        morning: { sku: 'Calm & Focus', dose: '1 cap' },
        midday: { sku: 'Booster Spray (Day)', dose: '2 sprays' },
      })),
    };
    savePlan(newPlan);
    refreshLocal();
  }

  if (!enabled) {
    return (
      <Card>
        <Text style={{ color: COLORS.gold, fontWeight: '700', marginBottom: 6 }}>
          AI Coach Enhancements
        </Text>
        <Text style={{ color: COLORS.sub }}>
          Enhancements unavailable (sqlite). Your normal coach screen still works.
        </Text>
      </Card>
    );
  }

  return (
    <View>
      <Card>
        <Text style={{ color: COLORS.gold, fontSize: 16, fontWeight: '700', marginBottom: 14 }}>
          Quick Check-in (EMA)
        </Text>
        {[
          ['Energy level (0–10)', energy, setEnergy],
          ['Mood (0 sad – 10 happy)', mood, setMood],
          ['Pain (0 none – 10 worst)', pain, setPain],
          ['Sleep quality (0 bad – 10 great)', sleep, setSleep],
        ].map(([label, val, setter]: any) => (
          <View key={label} style={{ marginBottom: 8 }}>
            <Text style={{ color: COLORS.text }}>{label}</Text>
            <TextInput
              keyboardType="numeric"
              value={val}
              onChangeText={setter}
              placeholder=""
              placeholderTextColor="#777"
              style={{
                backgroundColor: '#333a3aff',
                color: COLORS.text,
                padding: 12,
                borderRadius: 10,
                borderColor: COLORS.border,
                borderWidth: 1,
              }}
            />
          </View>
        ))}
        <Text style={{ color: COLORS.sub, marginTop: 4 }}>Note (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="e.g. took Calm cap 8:15am"
          placeholderTextColor="#999"
          style={{
            backgroundColor: '#333a3aff',
            color: COLORS.text,
            padding: 12,
            borderRadius: 10,
            borderColor: COLORS.border,
            borderWidth: 1,
            marginBottom: 10,
          }}
        />
        <TouchableOpacity
          onPress={submit}
          style={{
            backgroundColor: COLORS.gold,
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#111', fontWeight: '800' }}>Log check-in</Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <Text style={{ color: COLORS.gold, fontSize: 16, fontWeight: '700', marginBottom: 14 }}>
          AI Coach Hints
        </Text>
        {!plan && (
          <TouchableOpacity
            onPress={mkStarterPlan}
            style={{
              backgroundColor: COLORS.gold,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#111', fontWeight: '800' }}>Create starter plan</Text>
          </TouchableOpacity>
        )}
        {hints.map((h, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{h.title}</Text>
            <Text style={{ color: COLORS.text, marginBottom: 10 }}>{h.message}</Text>
            {h.suggestion ? (
              <Text style={{ color: COLORS.sub, marginTop: 4 }}>{h.suggestion}</Text>
            ) : null}
          </View>
        ))}
      </Card>
    </View>
  );
}

// ---- shared helpers ----

async function saveAtiCheckin(entry: any) {
  try {
    const raw = await AsyncStorage.getItem(ATI_KEYS.CHECKINS);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({
      timestamp: entry.timestamp,
      mood: entry.mood,
      pain: entry.pain,
      sleepHours: entry.sleep,
      note: entry.note,
    });
    await AsyncStorage.setItem(ATI_KEYS.CHECKINS, JSON.stringify(arr));
  } catch (e) {
    console.warn('saveAtiCheckin failed', e);
  }
}

export async function refreshAtiAndCoach() {
  try {
    const raw = await AsyncStorage.getItem(ATI_KEYS.CHECKINS);
    const all = raw ? JSON.parse(raw) : [];
    const last14 = all.slice(-14);

    const num = (x: any) => typeof x === 'number';
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

    const painVals = last14.map((c: any) => c.pain).filter(num);
    const sleepVals = last14.map((c: any) => c.sleepHours).filter(num);

    const snapshot = {
      windowDays: 14,
      count: last14.length,
      avgPain: avg(painVals),
      avgSleepHours: avg(sleepVals),
      items: last14,
    };

    await AsyncStorage.setItem(ATI_KEYS.ATI_INPUTS, JSON.stringify(snapshot));

    return {
      last14: snapshot,
      suggestions: buildSimpleSuggestions(snapshot),
    };
  } catch (e) {
    console.warn('refreshAtiAndCoach error', e);
    return { last14: { windowDays: 14, count: 0, items: [] }, suggestions: [] };
  }
}

export async function getCoachLast14() {
  const { last14 } = await refreshAtiAndCoach();
  return last14;
}

export async function getCoachSuggestions() {
  const { suggestions } = await refreshAtiAndCoach();
  return suggestions;
}

export { CoachExtras };

export default CoachExtras;

function buildSimpleSuggestions(snap: any): string[] {
  const out: string[] = [];
  if (!snap || !snap.items || !snap.items.length) {
    out.push('Log a quick check-in to unlock guidance.');
    return out;
  }
  if (snap.avgPain != null && snap.avgPain >= 6) {
    out.push('Pain is trending high — add Mobility & Function or shift dosing earlier.');
  }
  if (snap.avgSleepHours != null && snap.avgSleepHours < 6) {
    out.push('Sleep is low — add Rest & Restore at bedtime or reduce late THC.');
  }
  if (!out.length) out.push('Great consistency — keep daily check-ins.');
  return out;
}
