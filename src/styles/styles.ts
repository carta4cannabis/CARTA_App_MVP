
import { StyleSheet } from 'react-native';
import { useBrandTheme } from './theme';

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24
};

export function useStyles() {
  const t = useBrandTheme();
  const g = StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg, padding: spacing.lg },
    h1: { fontSize: 24, fontWeight: '700', marginBottom: spacing.md, color: t.text },
    h2: { fontSize: 18, fontWeight: '700', marginBottom: spacing.sm, color: t.text },
    p: { fontSize: 16, color: t.text },
    card: { backgroundColor: t.card, padding: spacing.md, borderRadius: 14, borderColor: t.border, borderWidth: 1, marginBottom: spacing.md, shadowColor: t.shadow, shadowOpacity: 1, shadowOffset: {width:0,height:1}, shadowRadius: 2 },
    button: { backgroundColor: t.accent, paddingVertical: spacing.sm+2, paddingHorizontal: spacing.lg, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    input: { borderColor: t.border, borderWidth: 1, borderRadius: 12, padding: spacing.sm, fontSize: 16, marginBottom: spacing.sm, color: t.text }
  });
  return { g, t };
}
