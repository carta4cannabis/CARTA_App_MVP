// Resilient shim: works whether the base file exports default OR only a named `CoachExtras`.
import DefaultExport, { CoachExtras as NamedCoachExtras } from '../addons/CARTA_CoachExtras';

const Resolved: any = (DefaultExport as any) ?? (NamedCoachExtras as any);
if (!Resolved) {
  console.warn('[CARTA_CoachExtras.named] Unable to resolve CoachExtras export. ' +
               'Ensure ./CARTA_CoachExtras exports a default or a named `CoachExtras`.');
}

export default Resolved;          // default import works
export { Resolved as CoachExtras }; // named import works too
export * from './CARTA_CoachExtras'; // pass through other helpers
