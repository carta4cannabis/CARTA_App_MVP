// app/src/screens/GuideScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { sendMessage, createSummary } from '../coach/coachClient';
import type { DosingState, SessionEvent } from '../coach/engine';
import { useNavigation } from '@react-navigation/native';

type Msg = { id: string; role: 'user'|'coach'; text: string };

export default function GuideScreen() {
  const nav = useNavigation<any>();
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'm0', role: 'coach', text: 'Hi! I’m your CARTA Guide. Ask me about timing, amounts, or how to tune your regimen.' }
  ]);
  const [input, setInput] = useState('');
  const sendingRef = useRef(false);

  // Minimal placeholders — replace with your real state / storage
  const dosingState: DosingState = {
    weightBand: '135-200',
    ageBand: '35-59',
    tolerance: 'mid',
    intensity: 'mid',
    dayGoals: ['Calm','Cognitive'],
    nightGoal: 'Rest',
    target: { thcMaxMg: 30, nonThcMaxMg: 300 },
  };
  const [recent, setRecent] = useState<SessionEvent[]>([]);

  useEffect(() => {
    // TODO: load recent sessions from your storage/context
    setRecent([]); // keep empty if you don't have any yet
  }, []);

  const onSend = useCallback(async () => {
    if (!input.trim() || sendingRef.current) return;
    sendingRef.current = true;
    const userMsg: Msg = { id: String(Date.now()), role: 'user', text: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    try {
      const res = await sendMessage({
        userId: 'local-user',
        question: userMsg.text,
        dosingState,
        recentSessions: recent,
      });
      const coachMsg: Msg = { id: String(Date.now()+1), role: 'coach', text: res.reply };
      setMessages(m => [...m, coachMsg]);
    } catch (e: any) {
      setMessages(m => [...m, { id: String(Date.now()+2), role: 'coach', text: `Sorry, I couldn’t process that: ${e.message}` }]);
    } finally {
      sendingRef.current = false;
    }
  }, [input, dosingState, recent]);

  const onSummary = useCallback(async () => {
    try {
      const r = await createSummary({
        userId: 'local-user',
        dosingState,
        sessions: recent,
        range: {}, // optional: add startISO/endISO
      });
      nav.navigate('SummaryPreview', { title: r.fileName, html: r.html });
    } catch (e: any) {
      Alert.alert('Summary error', e.message);
    }
  }, [dosingState, recent, nav]);

  return (
    <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <Text style={s.h1}>CARTA Guide</Text>
        <Pressable style={s.summaryBtn} onPress={onSummary}>
          <Text style={s.summaryText}>Preview Clinician Summary</Text>
        </Pressable>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m)=>m.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.role==='coach' ? s.coach : s.user]}>
            <Text style={s.bubbleText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={s.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about timing, amounts, pairings..."
          placeholderTextColor="#7D9189"
          style={s.input}
          onSubmitEditing={onSend}
          returnKeyType="send"
        />
        <Pressable style={s.sendBtn} onPress={onSend}>
          <Text style={s.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C1512' },
  header: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  h1: { color: '#E9EFEA', fontSize: 22, fontWeight: '700' },
  summaryBtn: {
    backgroundColor: '#132822', borderWidth: 1, borderColor: '#29433A',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8
  },
  summaryText: { color: '#E9EFEA', fontWeight: '600', fontSize: 12 },

  bubble: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '85%' },
  coach: { backgroundColor: '#0F1E1A', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#1F2C27' },
  user:  { backgroundColor: '#1C2A25', alignSelf: 'flex-end', borderWidth: 1, borderColor: '#29433A' },
  bubbleText: { color: '#E9EFEA' },

  inputRow: { flexDirection: 'row', gap: 8, padding: 16, paddingTop: 8 },
  input: {
    flex: 1, backgroundColor: '#0C1B17', borderWidth: 1, borderColor: '#243730',
    borderRadius: 10, paddingHorizontal: 12, color: '#E9EFEA'
  },
  sendBtn: { backgroundColor: '#C9A86A', paddingHorizontal: 14, borderRadius: 10, justifyContent: 'center' },
  sendText: { color: '#0C1512', fontWeight: '700' },
});