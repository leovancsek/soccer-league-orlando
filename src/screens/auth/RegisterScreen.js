import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme/theme";
import { Button } from "../../components/Shared";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing info", "Name, email, and password are required.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Weak password", "Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords don't match", "Please re-enter your password.");
      return;
    }
    setLoading(true);
    const { error } = await register({ email: email.trim(), password, name: name.trim() });
    setLoading(false);
    if (error) { Alert.alert("Couldn't create account", error); return; }
    Alert.alert(
      "Check your email",
      "We sent a confirmation link to verify your account. Once confirmed, sign in below."
    );
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Full name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Mateo Alvarez" />
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@email.com" />
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="At least 8 characters" />
            <Text style={styles.label}>Confirm password</Text>
            <TextInput style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" />
            <Button title={loading ? "Creating account..." : "Create account"} onPress={handleRegister} disabled={loading} style={{ marginTop: 22 }} />
            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 16, alignItems: "center" }}>
              <Text style={{ color: colors.slate, fontSize: 13 }}>
                Already have an account? <Text style={{ color: colors.turf, fontWeight: "700" }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
