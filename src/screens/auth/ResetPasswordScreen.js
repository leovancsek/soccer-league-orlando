import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme/theme";
import { Button } from "../../components/Shared";

// Reached via the deep link Supabase emails out (see AuthContext.requestPasswordReset,
// and the "soccerleagueorlando://reset-password" scheme registered in app.json).
export default function ResetPasswordScreen({ navigation }) {
  const { completePasswordReset } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (password.length < 8) { Alert.alert("Weak password", "Use at least 8 characters."); return; }
    if (password !== confirm) { Alert.alert("Passwords don't match", "Please re-enter your password."); return; }
    setLoading(true);
    const { error } = await completePasswordReset(password);
    setLoading(false);
    if (error) { Alert.alert("Couldn't reset password", error); return; }
    Alert.alert("Password updated", "You're signed in with your new password.");
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}><Text style={styles.title}>Set a new password</Text></View>
        <View style={styles.form}>
          <Text style={styles.label}>New password</Text>
          <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="At least 8 characters" />
          <Text style={styles.label}>Confirm new password</Text>
          <TextInput style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" />
          <Button title={loading ? "Saving..." : "Save new password"} onPress={handleSave} disabled={loading} style={{ marginTop: 22 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { backgroundColor: colors.pitch, padding: spacing.lg, paddingTop: 40 },
  title: { color: "#fff", fontWeight: "700", fontSize: 20 },
  form: { padding: spacing.xl },
  label: { fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", color: colors.slate, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
});
