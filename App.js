import React, { useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { LocaleProvider } from "./src/i18n/LocaleContext";
import { AuthProvider } from "./src/context/AuthContext";
import { AppProvider } from "./src/context/AppContext";
import RootNavigator from "./src/navigation/RootNavigator";

// Keep the native splash up until the JS tree has rendered at least once —
// without this, there's no explicit signal telling the splash when to
// dismiss, and a failure before the first render leaves it on screen
// forever with no indication anything went wrong.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const onRootViewLayout = useCallback(() => {
    // Reaching this callback means React successfully completed its first
    // render/layout pass — safe to reveal the real UI (or the
    // ErrorBoundary's fallback, if something further up already threw).
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    // Safety net: if layout never fires for some reason, don't leave the
    // splash up indefinitely.
    const timer = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider onLayout={onRootViewLayout}>
        <LocaleProvider>
          <AuthProvider>
            <AppProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </AppProvider>
          </AuthProvider>
        </LocaleProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
