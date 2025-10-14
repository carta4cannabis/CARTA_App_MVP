// src/guard-nonconfigurable.ts
/**
 * Prevent crashes from libraries trying to redefine non-configurable globals.
 * We keep Object.defineProperty behavior, but ignore attempts to redefine
 * known globals when the descriptor says configurable: false.
 *
 * Safe for dev and production; only intercepts a tiny set of properties.
 */
(function guardNonConfigurable() {
  const g: any = globalThis as any;
  const orig = Object.defineProperty;

  const BLOCKED = new Set(['crypto', 'navigator', 'performance']);

  Object.defineProperty = function (target: any, prop: PropertyKey, desc: PropertyDescriptor) {
    try {
      return orig(target, prop, desc);
    } catch (e: any) {
      const isGlobalTarget = target === g || target === g.global || target === g.window || target === g.self;
      if (
        isGlobalTarget &&
        typeof prop === 'string' &&
        BLOCKED.has(prop) &&
        /not configurable/i.test(String(e)) &&
        Object.getOwnPropertyDescriptor(target, prop)?.configurable === false
      ) {
        // Ignore redefinition and keep the current value.
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(`[guard] Ignored redefine of non-configurable global: ${String(prop)}`);
        }
        return (target as any)[prop];
      }
      throw e;
    }
  };
})();
