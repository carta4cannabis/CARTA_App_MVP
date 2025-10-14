// app/src/coach/coachClient.ts
import { buildClinicianSummaryHTML, DosingState, SessionEvent, suggestAdjustments } from './engine';

// Set this to your server URL when ready (e.g., 'https://api.yourdomain.com')
export const COACH_BASE_URL = ''; // empty = local fallback

type MsgReq = { userId: string; question: string; dosingState: DosingState; recentSessions: SessionEvent[] };
type MsgRes = { reply: string; actions: any[]; rationale_tags: string[] };

type SumReq = { userId: string; range?: { startISO?: string; endISO?: string }; dosingState: DosingState; sessions: SessionEvent[] };
type SumRes = { fileName: string; html: string };

export async function sendMessage(req: MsgReq): Promise<MsgRes> {
  if (!COACH_BASE_URL) {
    // Fallback: deterministic suggestion + templated reply
    const sug = suggestAdjustments(req.recentSessions, req.dosingState);
    return { reply: sug.reply, actions: sug.actions, rationale_tags: sug.rationale_tags };
  }
  const r = await fetch(`${COACH_BASE_URL}/coach/message`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!r.ok) throw new Error(`Coach API error ${r.status}`);
  return r.json();
}

export async function createSummary(req: SumReq): Promise<SumRes> {
  if (!COACH_BASE_URL) {
    const { startISO, endISO } = req.range || {};
    const html = buildClinicianSummaryHTML(req.sessions, req.dosingState, startISO, endISO);
    return { fileName: defaultFileName(startISO, endISO), html };
  }
  const r = await fetch(`${COACH_BASE_URL}/coach/summary`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!r.ok) throw new Error(`Coach API error ${r.status}`);
  return r.json();
}

function defaultFileName(startISO?: string, endISO?: string) {
  const clean = (s?: string) => (s ? s.slice(0,10) : 'range');
  return `CARTA_Summary_${clean(startISO)}_${clean(endISO)}.html`;
}