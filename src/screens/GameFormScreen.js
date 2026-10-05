import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useApp } from "../context/AppContext";
import { colors, spacing, radius } from "../theme/theme";
import { Button } from "../components/Shared";
import { useLocale } from "../i18n/LocaleContext";

const FORMATS = ["5v5", "7v7", "9v9", "11v11"];
// Skill level is temporarily hidden from this form — kept in state/save
// payload (defaulted) so nothing downstream that reads game.level breaks.
// const LEVELS = ["Beginner friendly", "Intermediate", "Advanced", "All levels"];

const WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formats a Date as "Wed, Sep 3" — the exact shape the rest of the app
// expects in game.date (GamesScreen's day filter reads the first 3
// letters), independent of the device's locale/language setting.
function formatGameDate(d) {
  return `${WEEKDAY_ABBR[d.getDay()]}, ${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

// Existing games only store a "Weekday, Mon DD" string with no year, so
// this is a best-effort parse (assumes the current year) — good enough to
// pre-fill the picker when editing; if it fails we just default to today.
function parseExistingDate(dateStr) {
  if (!dateStr) return new Date();
  const parsed = new Date(`${dateStr.split(",")[1]?.trim()}, ${new Date().getFullYear()}`);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function GameFormScreen({ route, navigation }) {
  const { t } = useLocale();
  const { gameId } = route.params || {};
  const { games, saveGame } = useApp();
  const existing = gameId ? games.find((g) => g.id === gameId) : null;

  const [image, setImage] = useState(existing?.image || null);
  const [listingType, setListingType] = useState(existing?.listingType || "casual");
  const [title, setTitle] = useState(existing?.title || "");
  const [format, setFormat] = useState(existing?.format || "5v5");
  const [venue, setVenue] = useState(existing?.venue || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [dateObj, setDateObj] = useState(parseExistingDate(existing?.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(existing?.time || "");
  const [price, setPrice] = useState(existing?.price || "");
  const [slots, setSlots] = useState(String(existing?.spotsTotal || 10));
  const [level] = useState(existing?.level || "Intermediate");

  const [dropInFee, setDropInFee] = useState(existing?.pricing?.dropInFee || "");
  const [monthlyFee, setMonthlyFee] = useState(existing?.pricing?.monthlyFee || "");
  const [leagueFee, setLeagueFee] = useState(existing?.pricing?.leagueFee || "");
  const [subFee, setSubFee] = useState(existing?.pricing?.subFee || "");

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t("gameForm.permissionNeededTitle"), t("gameForm.permissionNeededBody"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !venue.trim() || !time.trim()) {
      Alert.alert(t("gameForm.missingInfoTitle"), t("gameForm.missingInfoBody"));
      return;
    }
    const date = formatGameDate(dateObj);
    const dayShort = date.slice(0, 3).toUpperCase();
    const pricing = listingType === "league"
      ? { ...(existing?.pricing || {}), leagueFee: leagueFee || "$0", subFee: subFee || "$0" }
      : { ...(existing?.pricing || {}), dropInFee: dropInFee || "$0", monthlyFee: monthlyFee || "$0" };

    saveGame(gameId, {
      title: title.trim(), format, venue: venue.trim(), address: address.trim(),
      date, day: dayShort, time: time.trim(), price: price.trim() || "$0",
      spotsTotal: Math.max(1, parseInt(slots) || 10, existing?.spotsFilled || 0),
      level, listingType, pricing, image,
    });
    navigation.goBack();
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) setDateObj(selected);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{existing ? t("gameForm.editListing") : t("gameForm.newListing")}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <FieldLabel>{t("gameForm.fieldPhoto")}</FieldLabel>
        <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
          {image ? <Image source={{ uri: image }} style={styles.photoPreview} /> : (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 26 }}>📷</Text>
              <Text style={{ color: colors.slate, fontWeight: "600", fontSize: 12, marginTop: 4 }}>{t("gameForm.tapToUpload")}</Text>
            </View>
          )}
        </TouchableOpacity>

        <FieldLabel>{t("gameForm.listingType")}</FieldLabel>
        <View style={styles.typeToggle}>
          <TouchableOpacity style={[styles.typeBtn, listingType === "casual" && styles.typeBtnActive]} onPress={() => setListingType("casual")}>
            <Text style={[styles.typeBtnText, listingType === "casual" && styles.typeBtnTextActive]}>{t("gameForm.casualGame")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, listingType === "league" && styles.typeBtnActive]} onPress={() => setListingType("league")}>
            <Text style={[styles.typeBtnText, listingType === "league" && styles.typeBtnTextActive]}>{t("gameForm.league")}</Text>
          </TouchableOpacity>
        </View>

        <Field label={t("gameForm.titleLabel")} value={title} onChangeText={setTitle} placeholder={t("gameForm.titlePlaceholder")} />

        <FieldLabel>{t("gameForm.format")}</FieldLabel>
        <View style={styles.typeToggle}>
          {FORMATS.map((f) => (
            <TouchableOpacity key={f} style={[styles.typeBtn, format === f && styles.typeBtnActive]} onPress={() => setFormat(f)}>
              <Text style={[styles.typeBtnText, format === f && styles.typeBtnTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label={t("gameForm.venueName")} value={venue} onChangeText={setVenue} placeholder={t("gameForm.venuePlaceholder")} />
        <Field label={t("gameForm.address")} value={address} onChangeText={setAddress} placeholder={t("gameForm.addressPlaceholder")} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1, marginBottom: 16 }}>
            <FieldLabel>{t("gameForm.date")}</FieldLabel>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: colors.ink, fontSize: 14 }}>{formatGameDate(dateObj)}</Text>
            </TouchableOpacity>
          </View>
          <Field label={t("gameForm.time")} value={time} onChangeText={setTime} placeholder={t("gameForm.timePlaceholder")} style={{ flex: 1 }} />
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
          />
        )}
        {showDatePicker && Platform.OS === "ios" && (
          <Button title={t("common.done")} variant="outline" style={{ marginBottom: 16 }} onPress={() => setShowDatePicker(false)} />
        )}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Field label={t("gameForm.displayPrice")} value={price} onChangeText={setPrice} placeholder={t("gameForm.pricePlaceholder")} style={{ flex: 1 }} />
          <Field label={t("gameForm.totalSlots")} value={slots} onChangeText={setSlots} keyboardType="number-pad" style={{ flex: 1 }} />
        </View>

        <View style={styles.pricingCard}>
          <FieldLabel>{listingType === "league" ? t("gameForm.playerCostsLeague") : t("gameForm.playerCostsCasual")}</FieldLabel>
          {listingType === "league" ? (
            <>
              <Field label={t("gameForm.leagueFeeLabel")} value={leagueFee} onChangeText={setLeagueFee} placeholder={t("gameForm.leagueFeePlaceholder")} />
              <Field label={t("gameForm.subFeeLabel")} value={subFee} onChangeText={setSubFee} placeholder={t("gameForm.subFeePlaceholder")} />
            </>
          ) : (
            <>
              <Field label={t("gameForm.dropInFeeLabel")} value={dropInFee} onChangeText={setDropInFee} placeholder={t("gameForm.dropInFeePlaceholder")} />
              <Field label={t("gameForm.monthlyFeeLabel")} value={monthlyFee} onChangeText={setMonthlyFee} placeholder={t("gameForm.monthlyFeePlaceholder")} />
            </>
          )}
        </View>

        <Button title={existing ? t("gameForm.saveChanges") : t("gameForm.publishListing")} onPress={handleSave} style={{ marginTop: 8 }} />
        <Button title={t("common.cancel")} variant="ghost" style={{ marginTop: 10 }} onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ children }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}
function Field({ label, style, ...props }) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput style={styles.input} placeholderTextColor={colors.slate} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { backgroundColor: colors.pitch, padding: spacing.lg },
  title: { color: "#fff", fontWeight: "700", fontSize: 17 },
  fieldLabel: { fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", color: colors.slate, marginBottom: 6 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.ink },
  photoBox: { height: 150, borderRadius: 14, borderWidth: 2, borderColor: colors.line, borderStyle: "dashed", backgroundColor: colors.card, alignItems: "center", justifyContent: "center", marginBottom: 16, overflow: "hidden" },
  photoPreview: { width: "100%", height: "100%" },
  typeToggle: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, minWidth: 90, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.card, alignItems: "center" },
  levelBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.card },
  typeBtnActive: { backgroundColor: colors.turf, borderColor: colors.turf },
  typeBtnText: { fontSize: 13, fontWeight: "700", color: colors.slate },
  typeBtnTextActive: { color: "#fff" },
  pricingCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, marginBottom: 16 },
});
