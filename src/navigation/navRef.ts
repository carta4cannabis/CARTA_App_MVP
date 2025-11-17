import { createNavigationContainerRef, NavigatorScreenParams } from '@react-navigation/native';
import {
  getReliefMetricsForPdf,
  RELIEF_METRICS,
  RELIEF_METRIC_LABELS,
} from '../utils/reliefMetrics';

async function buildClinicianPdf() {
  const { series, summary } = await getReliefMetricsForPdf({
    maxDays: 30,
    maxEntries: 60,
  });

  // 1) Use `summary` at the top of the PDF:
  //    e.g. “Pain relief: 3.8 (n=14)”, etc.

  // 2) Feed `series` into your chart generator:
  //    each `series[key]` is an array of { x: Date, y: number } for one colored line.
}


/* ---------- Tabs (keep in sync with TabNavigator) ---------- */
export type TabsParamList = {
  Home: undefined;
  Dosing: undefined;
  Tracker: undefined;
  Coach: undefined;
  Products: undefined;
  Education: undefined;
  Quest: undefined;
  Scanner: undefined;
  Find: undefined;
  More: undefined;
};

/* ---------- Root Stack params ---------- */
export type RootParams = {
  Tabs: NavigatorScreenParams<TabsParamList> | undefined;
  OutcomesHubScreen: undefined;
  ProductsHubScreen: undefined;
  ToolsHubScreen: undefined;
  ProductDetails: { productId?: string } | undefined;
  SummaryPreview: { html?: string; title?: string } | undefined;
  HandoutViewer: { title?: string; uri: string } | undefined;
};

export type RootRouteName = keyof RootParams;

/** Typed navigation ref for the root container */
export const rootNavRef = createNavigationContainerRef<RootParams>();

/** Union of all route-param shapes (used for the buffer queue) */
type AnyRootParam = RootParams[keyof RootParams];

/** Buffer navigations until the container is ready */
const pending: Array<{ name: RootRouteName; params?: AnyRootParam }> = [];

/** Safe global navigate (works even if called very early) */
export function rootNavigate<Name extends RootRouteName>(
  name: Name,
  params?: RootParams[Name]
) {
  if (rootNavRef.isReady()) {
    // Cast through 'any' only at the boundary to silence TS generic friction.
    (rootNavRef as any).navigate(name, params);
  } else {
    pending.push({ name, params });
  }
}

/** Flush buffered navigations once the container is ready */
export function flushPendingNavigations() {
  if (!rootNavRef.isReady()) return;
  while (pending.length) {
    const { name, params } = pending.shift()!;
    try {
      (rootNavRef as any).navigate(name, params);
    } catch {
      // swallow — avoids noisy logs if a route was removed during startup
    }
  }
}
