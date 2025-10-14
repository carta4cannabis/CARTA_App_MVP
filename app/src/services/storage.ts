
import * as SQLite from 'expo-sqlite';

export type Session = {
  id?: number;
  date: string;
  productId: string;
  batchId: string;
  rating: number; // 1-5
  note?: string;
};

const db = SQLite.openDatabaseSync('carta.db');

export function initDb() {
  db.execSync(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    productId TEXT NOT NULL,
    batchId TEXT NOT NULL,
    rating INTEGER NOT NULL,
    note TEXT
  );`);
}

export function addSession(s: Session) {
  db.runSync('INSERT INTO sessions (date, productId, batchId, rating, note) VALUES (?, ?, ?, ?, ?);',
    [s.date, s.productId, s.batchId, s.rating, s.note ?? null]);
}

export function listSessions(): Session[] {
  const rs = db.getAllSync('SELECT * FROM sessions ORDER BY date DESC;');
  return rs as Session[];
}
