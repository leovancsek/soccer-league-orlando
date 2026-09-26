import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/LocaleContext";
import { colors, spacing } from "../../theme/theme";
import { Button, AuthBackground } from "../../components/Shared";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert(t("register.missingInfoTitle"), t("register.missingInfoBody"));
      return;
    }
    if (password.length < 8) {
      Alert.alert(t("register.weakPasswordTitle"), t("register.weakPasswordBody"));
      return;
    }
    if (password !== confirm) {
      Alert.alert(t("register.mismatchTitle"), t("register.mismatchBody"));
      return;
    }
    setLoading(true);
    const { error } = await register({ email: email.trim(), password, name: name.trim() });
    setLoading(false);
    if (error) { Alert.alert(t("register.errorTitle"), error); return; }
    Alert.alert(t("register.checkEmailTitle"), t("register.checkEmailBody"));
    navigation.navigate("Login");
  };

  return (
    <AuthBackground logoHeight={80}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.title}>{t("register.title")}</Text>
            </View>
            <View style={styles.form}>
              <Text style={styles.label}>{t("register.fullName")}</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t("register.fullNamePlaceholder")} placeholderTextColor={colors.slate} />
              <Text style={styles.label}>{t("register.email")}</Text>
              <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder={t("register.emailPlaceholder")} placeholderTextColor={colors.slate} />
              <Text style={styles.label}>{t("register.password")}</Text>
              <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder={t("register.passwordPlaceholder")} placeholderTextColor={colors.slate} />
              <Text style={styles.label}>{t("register.confirmPassword")}</Text>
              <TextInput style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} placeholder={t("register.confirmPasswordPlaceholder")} placeholderTextColor={colors.slate} />
              <Button title={loading ? t("register.submitting") : t("register.submit")} onPress={handleRegister} disabled={loading} style={{ marginTop: 22 }} />
              <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 16, alignItems: "center" }}>
                <Text style={styles.footerText}>
                  {t("register.haveAccount")} <Text style={styles.footerLink}>{t("register.signIn")}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingBottom: 10 },
  title: { color: "#fff", fontWeight: "700", fontSize: 22, textAlign: "center" },
  form: { padding: spacing.xl },
  label: { fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", color: "#D7E2FF", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.ink },
  footerText: { color: "#D7E2FF", fontSize: 13 },
  footerLink: { color: colors.lime, fontWeight: "700" },
});
