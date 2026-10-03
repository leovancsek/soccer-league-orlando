import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors, spacing } from "../theme/theme";

// Without this, an uncaught render error in a release build leaves the
// native splash screen on screen forever with zero indication anything
// went wrong — the exact symptom this was added to fix (app launches,
// shows the logo, then nothing). Catching it here at least surfaces the
// real error on screen instead of a silent infinite splash.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught render error:", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>{String(this.state.error?.message || this.state.error)}</Text>
            {this.state.error?.stack ? <Text style={styles.stack}>{this.state.error.stack}</Text> : null}
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk, paddingTop: 60 },
  title: { color: "#fff", fontWeight: "700", fontSize: 18, marginBottom: 12 },
  message: { color: colors.warn, fontSize: 14, marginBottom: 16 },
  stack: { color: colors.slate, fontSize: 11, fontFamily: "monospace" },
});
