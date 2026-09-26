import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/LocaleContext";
import { colors, spacing } from "../../theme/theme";
import { Button, AuthBackground } from "../../components/Shared";
import { SUPPORTED_LOCALES } from "../../i18n/translations";

const LANG_LABEL = { en: "EN", es: "ES", pt: "PT" };

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("login.missingInfoTitle"), t("login.missingInfoBody"));
      return;
    }
    setLoading(true);
    const { error } = await login({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert(t("login.errorTitle"), error);
  };

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.langRow}>
          {SUPPORTED_LOCALES.map((l) => (
            <TouchableOpacity key={l} onPress={() => setLocale(l)} style={[styles.langPill, locale === l && styles.langPillActive]}>
              <Text style={[styles.langText, locale === l && styles.langTextActive]}>{LANG_LABEL[l]}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.hero}>
            <Text style={styles.hello}>{t("login.hello")}</Text>
            <Text style={styles.subtitle}>{t("login.subtitle")}</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>{t("login.email")}</Text>
            <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder={t("login.emailPlaceholder")} placeholderTextColor={colors.slate} />
            <Text style={styles.label}>{t("login.password")}</Text>
            <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder={t("login.passwordPlaceholder")} placeholderTextColor={colors.slate} />
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={{ alignSelf: "flex-end", marginTop: 8, marginBottom: 20 }}>
              <Text style={styles.link}>{t("login.forgotPassword")}</Text>
            </TouchableOpacity>
            <Button title={loading ? t("login.signingIn") : t("login.signIn")} onPress={handleLogin} disabled={loading} />
            <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 18, alignItems: "center" }}>
              <Text style={styles.footerText}>
                {t("login.noAccount")} <Text style={styles.footerLink}>{t("login.createAccount")}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  langRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, paddingHorizontal: spacing.lg, paddingTop: 6 },
  langPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  langPillActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  langText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  langTextActive: { color: colors.pitch },
  hero: { alignItems: "center", paddingHorizontal: spacing.xl, paddingBottom: 20 },
  hello: { color: "#fff", fontWeight: "700", fontSize: 32 },
  subtitle: { color: "#D7E2FF", fontSize: 14, marginTop: 6, textAlign: "center" },
  form: { padding: spacing.xl, paddingTop: 10 },
  label: { fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", color: "#D7E2FF", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.ink },
  link: { color: "#fff", fontWeight: "700", fontSize: 12.5, textDecorationLine: "underline" },
  footerText: { color: "#D7E2FF", fontSize: 13 },
  footerLink: { color: colors.lime, fontWeight: "700" },
});
