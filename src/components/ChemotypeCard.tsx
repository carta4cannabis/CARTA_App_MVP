
import React from 'react';
import { View, Text } from 'react-native';
import { useStyles, spacing } from '../styles/styles';
import { deriveEffectTags } from '../services/chemotype';
import type { Coa } from '../services/api';
import { Chip } from './Chip';

export function ChemotypeCard({ coa }: { coa: Coa }) {
  const { g, t } = useStyles();
  const tags = deriveEffectTags(coa.terpenes);
  const top = Object.entries(coa.terpenes).sort((a,b) => b[1]-a[1]).slice(0,3);

  return (
    <View style={g.card} accessibilityRole="summary">
      <Text style={g.h2}>Chemotype</Text>
      <Text style={g.p}>THC: {coa.thc?.toFixed(1) ?? 0}%  ·  CBD: {coa.cbd?.toFixed(1) ?? 0}%</Text>

      <View style={{ height: spacing.sm }} />
      <Text style={[g.p, { color: t.muted }]}>Top terpenes</Text>
      {top.map(([k,v]) => <Text key={k} style={g.p}>• {k.replaceAll('_',' ').toUpperCase()} — {v.toFixed(2)}%</Text>)}

      <View style={{ height: spacing.sm }} />
      <Text style={[g.p, { color: t.muted }]}>Effect guidance</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
        {tags.length ? tags.map(tag => <Chip key={tag} label={tag} />) : <Text style={g.p}>—</Text>}
      </View>
    </View>
  );
}
