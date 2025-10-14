// app/src/polyfills.ts
// Safe, engine-aware polyfills.
// Uses Hermes' built-in crypto when present.
// Falls back to expo-random only if crypto.getRandomValues is missing (JSC).

import * as Random from 'expo-random';

export function installPolyfills() {
  const g: any = global as any;

  // If Hermes is running, crypto.getRandomValues already exists (and is non-configurable).
  // Do nothing in that case to avoid the "property is not configurable" crash.
  const isHermes = typeof g.HermesInternal !== 'undefined';
  if (isHermes) return;

  // JSC: if crypto or getRandomValues is missing, provide a minimal implementation.
  if (!g.crypto || typeof g.crypto.getRandomValues !== 'function') {
    g.crypto = g.crypto || {};
    Object.defineProperty(g.crypto, 'getRandomValues', {
      value: (typedArray: Uint8Array) => {
        const bytes = Random.getRandomBytes(typedArray.byteLength);
        typedArray.set(bytes);
        return typedArray;
      },
      writable: false,
      configurable: true,
      enumerable: false,
    });
  }
}


