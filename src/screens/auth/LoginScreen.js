import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme/theme";
import { Button } from "../../components/Shared";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await login({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert("Couldn't sign in", error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.hero}>
          <Text style={styles.logo}>⚽</Text>
          <Text style={styles.brand}>Soccer League Orlando</Text>
          <Text style={styles.tagline}>Find your next pickup game</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@email.com" />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="••••••••" />
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={{ alignSelf: "flex-end", marginTop: 8, marginBottom: 20 }}>
            <Text style={{ color: colors.turf, fontWeight: "600", fontSize: 12.5 }}>Forgot password?</Text>
          </TouchableOpacity>
          <Button title={loading ? "Signing in..." : "Sign in"} onPress={handleLogin} disabled={loading} />
          <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 18, alignItems: "center" }}>
            <Text style={{ color: colors.slate, fontSize: 13 }}>
              New here? <Text style={{ color: colors.turf, fontWeight: "700" }}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  hero: { backgroundColor: colors.pitch, paddingTop: 60, paddingBottom: 40, alignItems: "center" },
  logo: { fontSize: 40 },
  brand: { color: "#fff", fontWeight: "700", fontSize: 20, marginTop: 8 },
  tagline: { color: "#C9D6F5", fontSize: 13, marginTop: 4 },
  form: { padding: spacing.xl },
  label: { fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", color: colors.slate, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
});
