import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { savePlan } from './coachEnhance';
import type { GoalType, DeliveryPreference, ProtocolDay, ProtocolPlan } from './types';

const COLORS = { text:'#EAEAEA', sub:'#C9C9C9', gold:'#C7A44A', card:'#121616', accent:'#83C5BE', border:'#2A2F2F' };
const Card = (p:any) => <View style={{ backgroundColor: COLORS.card, borderWidth:1, borderColor: COLORS.gold, borderRadius:12, padding:16, marginBottom:12 }} {...p} />;

const SKUS: Record<GoalType, { capsule: string; spray: string }> = {
  sleep: { capsule:'Rest & Restore', spray:'Booster Spray (Night)' },
  focus: { capsule:'Calm & Focus', spray:'Booster Spray (Day)' },
  calm: { capsule:'Calm & Focus', spray:'Booster Spray (Day)' },
  recovery: { capsule:'Mobility & Function', spray:'Stacker Spray' },
  mood: { capsule:'Mood & Uplift', spray:'Booster Spray (Day)' },
};

export default function CARTA_GoalBuilderScreen({ navigation }: any) {
  const [goal, setGoal] = useState<GoalType>('focus');
  const [duration, setDuration] = useState<7 | 14 | 30>(14);
  const [delivery, setDelivery] = useState<DeliveryPreference>('both');
  const [note, setNote] = useState('');

  const buildDays = (): ProtocolDay[] => {
    const sku = SKUS[goal];
    const days: ProtocolDay[] = [];
    for (let i=0;i<duration;i++) {
      const d: ProtocolDay = { dayIndex:i, notes: note || undefined };
      if (delivery==='capsules' || delivery==='both') {
        d.morning = { sku: sku.capsule, dose:'1 cap' };
        if (goal==='focus'||goal==='mood'||goal==='calm') d.midday = { sku: sku.capsule, dose:'1 cap' };
        if (goal==='sleep'||goal==='recovery') d.evening = { sku: sku.capsule, dose:'1 cap' };
      }
      if (delivery==='sprays' || delivery==='both') {
        if (goal!=='sleep') d.midday = { ...(d.midday||{ sku: sku.spray, dose:'2 sprays' }), sku: sku.spray, dose:'2 sprays' };
        else d.evening = { ...(d.evening||{ sku: sku.spray, dose:'2 sprays' }), sku: sku.spray, dose:'2 sprays' };
      }
      days.push(d);
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
      { text:'Open Coach', onPress: () => navigation?.navigate?.('Coach') },
      { text:'OK' },
    ]);
  };

  return (
    <ScrollView style={{ flex:1, backgroundColor:'#0B0F0E', padding:16 }} contentContainerStyle={{ paddingBottom:24 }}>
      <Text style={{ color: COLORS.text, fontSize:22, fontWeight:'800' }}>Goal-Driven Protocol Builder</Text>
      <Text style={{ color: COLORS.sub, marginBottom:12 }}>Create a 7/14/30-day plan the Coach can optimize.</Text>

      <Card>
        <Text style={{ color: COLORS.sub, marginBottom: 8 }}>Select Goal</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
          {(['sleep','focus','calm','recovery','mood'] as GoalType[]).map(g => (
            <TouchableOpacity key={g} onPress={() => setGoal(g)} style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:999, borderWidth:1, borderColor: COLORS.gold, backgroundColor: goal===g ? '#232826' : '#1C2020', marginRight:8, marginBottom:8 }}>
              <Text style={{ color: COLORS.gold, fontWeight:'800' }}>{g.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: COLORS.sub, marginVertical: 8 }}>Duration</Text>
        <View style={{ flexDirection:'row' }}>
          {[7,14,30].map(d => (
            <TouchableOpacity key={d} onPress={() => setDuration(d as any)} style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:999, borderWidth:1, borderColor: COLORS.gold, backgroundColor: duration===d ? '#232826' : '#1C2020', marginRight:8 }}>
              <Text style={{ color: COLORS.gold, fontWeight:'800' }}>{d} Days</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: COLORS.sub, marginVertical: 8 }}>Delivery Preference</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
          {(['capsules','sprays','both'] as DeliveryPreference[]).map(d => (
            <TouchableOpacity key={d} onPress={() => setDelivery(d)} style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:999, borderWidth:1, borderColor: COLORS.gold, backgroundColor: delivery===d ? '#232826' : '#1C2020', marginRight:8, marginBottom:8 }}>
              <Text style={{ color: COLORS.gold, fontWeight:'800' }}>{d.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: COLORS.sub, marginVertical: 8 }}>Notes (optional)</Text>
        <TextInput
          style={{ backgroundColor:'#1A1F1F', color: COLORS.text, padding:12, borderRadius:10, borderColor: '#2B3030', borderWidth:1, marginBottom:10 }}
          placeholder="e.g., Avoid daytime sedation; prefer morning focus"
          placeholderTextColor="#777"
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity onPress={createPlan} style={{ backgroundColor: COLORS.gold, borderRadius:10, paddingVertical:12, alignItems:'center' }}>
          <Text style={{ color:'#111', fontWeight:'800' }}>Create Plan</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}
