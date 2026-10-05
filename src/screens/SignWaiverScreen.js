import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../context/AuthContext";
import { colors, spacing, radius } from "../theme/theme";
import { Button, HeaderLogo } from "../components/Shared";
import { useLocale } from "../i18n/LocaleContext";

const WAIVER_URL = process.env.EXPO_PUBLIC_SMARTWAIVER_WAIVER_URL;

export default function SignWaiverScreen({ navigation }) {
  const { t } = useLocale();
  const { session, refreshProfile } = useAuth();
  const [checking, setChecking] = useState(false);

  const openWaiver = async () => {
    if (!WAIVER_URL) {
      Alert.alert(
        t("signWaiver.notConfiguredTitle"),
        t("signWaiver.notConfiguredBody")
      );
      return;
    }
    // tag1 lets smartwaiver-webhook match the signed waiver back to this
    // user (see that Edge Function's comments for the exact field it reads).
    await WebBrowser.openBrowserAsync(`${WAIVER_URL}?tag1=${session.user.id}`);
  };

  const checkStatus = async () => {
    setChecking(true);
    const { data, error } = await refreshProfile();
    setChecking(false);
    if (error) {
      Alert.alert(t("signWaiver.couldntCheckStatus"), error);
    } else if (data?.waiver_accepted) {
      navigation.goBack();
    } else {
      Alert.alert(
        t("signWaiver.notSignedYetTitle"),
        t("signWaiver.notSignedYetBody")
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderLogo size={26} />
        <Text style={styles.title}>{t("signWaiver.title")}</Text>
      </View>
      <View style={styles.pad}>
        <View style={styles.card}>
          <Text style={styles.icon}>📝</Text>
          <Text style={styles.heading}>{t("signWaiver.heading")}</Text>
          <Text style={styles.body}>
            {t("signWaiver.body")}
          </Text>
        </View>
        <Button title={t("signWaiver.signWaiver")} onPress={openWaiver} style={{ marginTop: 8 }} />
        <Button
          title={checking ? t("signWaiver.checking") : t("signWaiver.checkAgain")}
          variant="outline"
          disabled={checking}
          style={{ marginTop: 12 }}
          onPress={checkStatus}
        />
        {checking && <ActivityIndicator style={{ marginTop: 16 }} color={colors.turf} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { backgroundColor: colors.pitch, padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: 10 },
  title: { color: "#fff", fontWeight: "700", fontSize: 19 },
  pad: { padding: spacing.lg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 20, alignItems: "center", marginBottom: 8 },
  icon: { fontSize: 36, marginBottom: 10 },
  heading: { fontSize: 16, fontWeight: "700", color: colors.ink, textAlign: "center" },
  body: { fontSize: 13.5, color: colors.slate, textAlign: "center", marginTop: 8, lineHeight: 19 },
});
