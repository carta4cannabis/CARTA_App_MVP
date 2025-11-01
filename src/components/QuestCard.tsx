import React, { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect, useReducer, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Quest } from '../types';
import { styles, theme } from '../theme/styles';

interface Props {
  quest: Quest;
  onTaskPress: (taskId: string) => void;
}

export default function QuestCard({ quest, onTaskPress }: Props) {
  const completed = quest.tasks.every(t => t.completed);
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>{quest.title}</Text>
        {completed && (
          <View style={styles.badge}><Text style={styles.badgeText}>Completed</Text></View>
        )}
      </View>
      <Text style={{ color: theme.colors.subtext, marginBottom: 10 }}>{quest.description}</Text>
      {quest.tasks.map(t => (
        <TouchableOpacity key={t.id} onPress={() => onTaskPress(t.id)} style={{ paddingVertical: 8 }}>
          <Text style={{ color: t.completed ? theme.colors.success : theme.colors.text }}>
            {t.completed ? '✓ ' : '○ '}{t.label}
          </Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 8 }} />
      <View style={styles.badge}><Text style={styles.badgeText}>Reward: {quest.rewardKP} KP</Text></View>
    </View>
  );
}