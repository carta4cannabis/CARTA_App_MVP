import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { EMACheckin } from '../types';
import { styles } from '../theme/styles';

interface Props {
  onSubmit: (entry: EMACheckin) => Promise<void> | void;
  cta?: string;
}

function NumberInput({ label, value, onChange }: { label: string; value?: number; onChange: (n?: number) => void }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: '#C9C9C9', marginBottom: 4 }}>{label} (1–10)</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.input}
        placeholder=""
        placeholderTextColor="#777"
        value={value != null ? String(value) : ''}
        onChangeText={(t) => {
          const n = parseInt(t, 10);
          onChange(Number.isNaN(n) ? undefined : n);
        }}
      />
    </View>
  );
}

export default function EMAQuickCheckin({ onSubmit, cta = 'Log Check-in' }: Props) {
  const [energy, setEnergy] = useState<number | undefined>();
  const [mood, setMood] = useState<number | undefined>();
  const [pain, setPain] = useState<number | undefined>();
  const [sleep, setSleep] = useState<number | undefined>();
  const [note, setNote] = useState<string>('');

  const submit = async () => {
    const entry: EMACheckin = {
      timestamp: Date.now(),
      energy, mood, pain, sleep, note: note || undefined,
    };
    await onSubmit(entry);
    setEnergy(undefined); setMood(undefined); setPain(undefined); setSleep(undefined); setNote('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Quick Check-in</Text>
      <Text style={styles.subtitle}>5-second EMA to train your coach</Text>

      <NumberInput label="Energy" value={energy} onChange={setEnergy} />
      <NumberInput label="Mood" value={mood} onChange={setMood} />
      <NumberInput label="Pain (0–10)" value={pain} onChange={setPain} />
      <NumberInput label="Sleep Quality" value={sleep} onChange={setSleep} />

      <Text style={{ color: '#C9C9C9', marginBottom: 4 }}>Note (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Took Calm capsule at 8:15 AM"
        placeholderTextColor="#777"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>{cta}</Text>
      </TouchableOpacity>
    </View>
  );
}