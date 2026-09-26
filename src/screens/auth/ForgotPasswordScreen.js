import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/LocaleContext";
import { colors, spacing, radius } from "../../theme/theme";
import { Button, AuthBackground } from "../../components/Shared";

export default function ForgotPasswordScreen({ navigation }) {
  const { requestPasswordReset } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) { Alert.alert(t("forgot.missingEmailTitle"), t("forgot.missingEmailBody")); return; }
    setLoading(true);
    const { error } = await requestPasswordReset(email.trim());
    setLoading(false);
    if (error) { Alert.alert(t("forgot.errorTitle"), error); return; }
    setSent(true);
  };

  return (
    <AuthBackground logoHeight={80}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("forgot.title")}</Text>
          </View>
          <View style={styles.form}>
            {sent ? (
              <View style={styles.confirmBox}>
                <Text style={{ fontSize: 26, marginBottom: 10 }}>📧</Text>
                <Text style={{ fontWeight: "700", fontSize: 15, marginBottom: 6, color: colors.ink }}>{t("forgot.sentTitle")}</Text>
                <Text style={{ color: colors.slate, fontSize: 13, textAlign: "center", lineHeight: 19 }}>
                  {t("forgot.sentBody", email)}
                </Text>
                <Button title={t("forgot.backToLogin")} variant="outline" style={{ marginTop: 22, alignSelf: "stretch" }} onPress={() => navigation.navigate("Login")} />
              </View>
            ) : (
              <>
                <Text style={styles.body}>{t("forgot.body")}</Text>
                <Text style={styles.label}>{t("forgot.email")}</Text>
                <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder={t("forgot.emailPlaceholder")} placeholderTextColor={colors.slate} />
                <Button title={loading ? t("forgot.submitting") : t("forgot.submit")} onPress={handleSend} disabled={loading} style={{ marginTop: 22 }} />
              </>
            )}
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
  body: { color: "#D7E2FF", fontSize: 13, marginBottom: 20, lineHeight: 19 },
  label: { fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", color: "#D7E2FF", marginBottom: 6 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.ink },
  confirmBox: { alignItems: "center", padding: 20, backgroundColor: colors.card, borderRadius: radius.lg },
});
