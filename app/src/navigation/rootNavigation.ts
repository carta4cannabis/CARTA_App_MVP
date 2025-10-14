// app/src/navigation/rootNavigation.ts
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

/** Navigate on the ROOT stack from anywhere (even inside Tabs). */
export function navigateRoot(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

/** Navigate to a specific Tab screen from anywhere. */
export function navigateTab(screen: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Tabs' as never, { screen, params } as never);
  }
}
