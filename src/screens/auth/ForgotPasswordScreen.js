import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme/theme";
import { Button } from "../../components/Shared";

export default function ForgotPasswordScreen({ navigation }) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) { Alert.alert("Missing email", "Enter the email you registered with."); return; }
    setLoading(true);
    const { error } = await requestPasswordReset(email.trim());
    setLoading(false);
    if (error) { Alert.alert("Couldn't send reset email", error); return; }
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset your password</Text>
        </View>
        <View style={styles.form}>
          {sent ? (
            <View style={styles.confirmBox}>
              <Text style={{ fontSize: 26, marginBottom: 10 }}>📧</Text>
              <Text style={{ fontWeight: "700", fontSize: 15, marginBottom: 6 }}>Check your inbox</Text>
              <Text style={{ color: colors.slate, fontSize: 13, textAlign: "center", lineHeight: 19 }}>
                If an account exists for {email}, we've sent a link to reset your password. Follow it to set a new one.
              </Text>
              <Button title="Back to sign in" variant="outline" style={{ marginTop: 22, alignSelf: "stretch" }} onPress={() => navigation.navigate("Login")} />
            </View>
          ) : (
            <>
              <Text style={{ color: colors.slate, fontSize: 13, marginBottom: 20, lineHeight: 19 }}>
                Enter the email on your account and we'll send you a link to reset your password.
              </Text>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@email.com" />
              <Button title={loading ? "Sending..." : "Send reset link"} onPress={handleSend} disabled={loading} style={{ marginTop: 22 }} />
            </>
          )}
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
  label: { fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", color: colors.slate, marginBottom: 6 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  confirmBox: { alignItems: "center", padding: 20 },
});
