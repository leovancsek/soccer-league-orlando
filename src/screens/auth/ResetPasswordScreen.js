import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/LocaleContext";
import { colors, spacing } from "../../theme/theme";
import { Button, AuthBackground } from "../../components/Shared";

// Reached via the deep link Supabase emails out (see AuthContext.requestPasswordReset,
// and the "soccerleagueorlando://reset-password" scheme registered in app.json).
export default function ResetPasswordScreen({ navigation }) {
  const { completePasswordReset } = useAuth();
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (password.length < 8) { Alert.alert(t("reset.weakPasswordTitle"), t("reset.weakPasswordBody")); return; }
    if (password !== confirm) { Alert.alert(t("reset.mismatchTitle"), t("reset.mismatchBody")); return; }
    setLoading(true);
    const { error } = await completePasswordReset(password);
    setLoading(false);
    if (error) { Alert.alert(t("reset.errorTitle"), error); return; }
    Alert.alert(t("reset.successTitle"), t("reset.successBody"));
    navigation.navigate("Login");
  };

  return (
    <AuthBackground logoHeight={80}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.header}><Text style={styles.title}>{t("reset.title")}</Text></View>
          <View style={styles.form}>
            <Text style={styles.label}>{t("reset.newPassword")}</Text>
            <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder={t("reset.newPasswordPlaceholder")} placeholderTextColor={colors.slate} />
            <Text style={styles.label}>{t("reset.confirmPassword")}</Text>
            <TextInput style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} placeholder={t("reset.confirmPasswordPlaceholder")} placeholderTextColor={colors.slate} />
            <Button title={loading ? t("reset.submitting") : t("reset.submit")} onPress={handleSave} disabled={loading} style={{ marginTop: 22 }} />
          </View>
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
});
