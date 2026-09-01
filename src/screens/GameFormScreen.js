import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../context/AppContext";
import { colors, spacing, radius } from "../theme/theme";
import { Button } from "../components/Shared";

const FORMATS = ["5v5", "7v7", "11v11"];
const LEVELS = ["Beginner friendly", "Intermediate", "Advanced", "All levels"];

export default function GameFormScreen({ route, navigation }) {
  const { gameId } = route.params || {};
  const { games, saveGame } = useApp();
  const existing = gameId ? games.find((g) => g.id === gameId) : null;

  const [image, setImage] = useState(existing?.image || null);
  const [listingType, setListingType] = useState(existing?.listingType || "casual");
  const [title, setTitle] = useState(existing?.title || "");
  const [format, setFormat] = useState(existing?.format || "5v5");
  const [venue, setVenue] = useState(existing?.venue || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [date, setDate] = useState(existing?.date || "");
  const [time, setTime] = useState(existing?.time || "");
  const [price, setPrice] = useState(existing?.price || "");
  const [slots, setSlots] = useState(String(existing?.spotsTotal || 10));
  const [level, setLevel] = useState(existing?.level || "Intermediate");

  const [dropInFee, setDropInFee] = useState(existing?.pricing?.dropInFee || "");
  const [monthlyFee, setMonthlyFee] = useState(existing?.pricing?.monthlyFee || "");
  const [leagueFee, setLeagueFee] = useState(existing?.pricing?.leagueFee || "");
  const [subFee, setSubFee] = useState(existing?.pricing?.subFee || "");

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to upload a field photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !venue.trim() || !date.trim() || !time.trim()) {
      Alert.alert("Missing info", "Please fill in title, venue, date and time.");
      return;
    }
    const dayShort = date.slice(0, 3).toUpperCase();
    const pricing = listingType === "league"
      ? { ...(existing?.pricing || {}), leagueFee: leagueFee || "$0", subFee: subFee || "$0" }
      : { ...(existing?.pricing || {}), dropInFee: dropInFee || "$0", monthlyFee: monthlyFee || "$0" };

    saveGame(gameId, {
      title: title.trim(), format, venue: venue.trim(), address: address.trim(),
      date: date.trim(), day: dayShort, time: time.trim(), price: price.trim() || "$0",
      spotsTotal: Math.max(1, parseInt(slots) || 10, existing?.spotsFilled || 0),
      level, listingType, pricing, image,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{existing ? "Edit listing" : "New game or tournament"}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <FieldLabel>Field photo</FieldLabel>
        <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
          {image ? <Image source={{ uri: image }} style={styles.photoPreview} /> : (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 26 }}>📷</Text>
              <Text style={{ color: colors.slate, fontWeight: "600", fontSize: 12, marginTop: 4 }}>Tap to upload a photo of the field</Text>
            </View>
          )}
        </TouchableOpacity>

        <FieldLabel>Listing type</FieldLabel>
        <View style={styles.typeToggle}>
          <TouchableOpacity style={[styles.typeBtn, listingType === "casual" && styles.typeBtnActive]} onPress={() => setListingType("casual")}>
            <Text style={[styles.typeBtnText, listingType === "casual" && styles.typeBtnTextActive]}>⚽ Casual game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, listingType === "league" && styles.typeBtnActive]} onPress={() => setListingType("league")}>
            <Text style={[styles.typeBtnText, listingType === "league" && styles.typeBtnTextActive]}>🏆 League</Text>
          </TouchableOpacity>
        </View>

        <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Tuesday Night Turf League" />

        <FieldLabel>Format</FieldLabel>
        <View style={styles.typeToggle}>
          {FORMATS.map((f) => (
            <TouchableOpacity key={f} style={[styles.typeBtn, format === f && styles.typeBtnActive]} onPress={() => setFormat(f)}>
              <Text style={[styles.typeBtnText, format === f && styles.typeBtnTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Venue name" value={venue} onChangeText={setVenue} placeholder="e.g. Blanchard Park Fields" />
        <Field label="Address" value={address} onChangeText={setAddress} placeholder="Street, Orlando" />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Field label="Date" value={date} onChangeText={setDate} placeholder="e.g. Tue, Sep 2" style={{ flex: 1 }} />
          <Field label="Time" value={time} onChangeText={setTime} placeholder="e.g. 19:00" style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Field label="Display price" value={price} onChangeText={setPrice} placeholder="e.g. $15" style={{ flex: 1 }} />
          <Field label="Total slots" value={slots} onChangeText={setSlots} keyboardType="number-pad" style={{ flex: 1 }} />
        </View>

        <FieldLabel>Skill level</FieldLabel>
        <View style={styles.typeToggle}>
          {LEVELS.map((l) => (
            <TouchableOpacity key={l} style={[styles.levelBtn, level === l && styles.typeBtnActive]} onPress={() => setLevel(l)}>
              <Text style={[styles.typeBtnText, { fontSize: 11 }, level === l && styles.typeBtnTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pricingCard}>
          <FieldLabel>Player costs — {listingType === "league" ? "league" : "casual"}</FieldLabel>
          {listingType === "league" ? (
            <>
              <Field label="League player fee (per season)" value={leagueFee} onChangeText={setLeagueFee} placeholder="e.g. $150" />
              <Field label="Substitute fee (per game)" value={subFee} onChangeText={setSubFee} placeholder="e.g. $20" />
            </>
          ) : (
            <>
              <Field label="Drop-in price (one-off, per game)" value={dropInFee} onChangeText={setDropInFee} placeholder="e.g. $15" />
              <Field label="Monthly price (regular weekly slot)" value={monthlyFee} onChangeText={setMonthlyFee} placeholder="e.g. $45" />
            </>
          )}
        </View>

        <Button title={existing ? "Save changes" : "Publish listing"} onPress={handleSave} style={{ marginTop: 8 }} />
        <Button title="Cancel" variant="ghost" style={{ marginTop: 10 }} onPress={() => navigation.goBack()} />
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
