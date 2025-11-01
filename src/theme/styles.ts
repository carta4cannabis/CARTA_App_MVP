import { StyleSheet } from 'react-native';

export const theme = {
  colors: {
    bg: '#0B0F0E',
    card: '#111616',
    text: '#EAEAEA',
    subtext: '#C9C9C9',
    gold: '#C7A44A',
    accent: '#83C5BE',
    success: '#6ECB63',
    danger: '#FF6B6B',
  },
  radius: 12,
  spacing: (n: number) => n * 8,
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.subtext,
    marginBottom: 12,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  button: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: '#1A1F1F',
    borderRadius: 10,
    padding: 12,
    color: '#EAEAEA',
    borderWidth: 1,
    borderColor: '#2B3030',
    marginBottom: 10,
  },
  hint: {
    color: '#83C5BE',
    fontSize: 13,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1C2020',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C7A44A',
  },
  badgeText: {
    color: '#C7A44A',
    fontWeight: '700',
    fontSize: 12,
  },
});
