import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { NavHeader } from '../components/NavHeader';

type Entry = { id: string; text: string; ts: number };

export const LogScreen: React.FC = () => {
  const [text, setText] = useState('');
  const [items, setItems] = useState<Entry[]>([]);

  const add = () => {
    const clean = text.trim();
    if (!clean) return;
    setItems((prev) => [{ id: String(Date.now()), text: clean, ts: Date.now() }, ...prev]);
    setText('');
  };

  return (
    <View style={styles.container}>
      <NavHeader title="Log / Journal" />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a quick note (effects, dose, time)…"
          placeholderTextColor="#a7cfc7"
          value={text}
          onChangeText={setText}
        />
        <Pressable onPress={add} style={styles.addBtn}>
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Text style={styles.empty}>No entries yet. Add your first note above.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.when}>{new Date(item.ts).toLocaleString()}</Text>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1f1c' },
  inputRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: '#12312c',
    color: '#e9fffb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1f403a',
  },
  addBtn: { backgroundColor: '#126e66', paddingHorizontal: 14, borderRadius: 10, justifyContent: 'center' },
  addText: { color: '#fff', fontWeight: '700' },
  empty: { color: '#cfe', opacity: 0.9, paddingHorizontal: 16, paddingTop: 8 },
  card: { backgroundColor: '#12312c', borderRadius: 12, borderWidth: 1, borderColor: '#1f403a', padding: 12 },
  when: { color: '#9dd5cc', fontSize: 12, marginBottom: 6 },
  text: { color: '#fff' },
});

export default LogScreen;

