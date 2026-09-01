import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, spacing, radius } from "../theme/theme";
import { Avatar, Button } from "../components/Shared";

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function ProfileScreen() {
  const { profile, setProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);

  const startEdit = () => { setForm(profile); setEditing(true); };
  const save = () => { setProfile(form); setEditing(false); };

  if (editing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.headerTitle}>Edit profile</Text></View>
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <Field label="Full name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <FieldLabel>Position</FieldLabel>
          <ChipRow options={POSITIONS} value={form.position} onChange={(v) => setForm({ ...form, position: v })} />
          <FieldLabel>Skill level</FieldLabel>
          <ChipRow options={LEVELS} value={form.level} onChange={(v) => setForm({ ...form, level: v })} />
          <Field label="City" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
          <FieldLabel>Bio</FieldLabel>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
            multiline
            value={form.bio}
            onChangeText={(v) => setForm({ ...form, bio: v })}
          />
          <Button title="Save changes" onPress={save} style={{ marginTop: 20 }} />
          <Button title="Cancel" variant="ghost" style={{ marginTop: 10 }} onPress={() => setEditing(false)} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <Avatar name={profile.name} size={84} bg={colors.lime} color={colors.pitch} />
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.subline}>{profile.position} · {profile.level} · {profile.city}</Text>
          <View style={styles.scoreboard}>
            <Stat n={profile.gamesPlayed} l="Games" />
            <Stat n={profile.rating} l="Rating" />
            <Stat n={profile.wins} l="Wins" />
          </View>
        </View>
        <View style={styles.pad}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>About</Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: colors.ink }}>{profile.bio}</Text>
          </View>
          <Button title="Edit profile" onPress={startEdit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, l }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{l}</Text>
    </View>
  );
}
function FieldLabel({ children }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}
function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}
function ChipRow({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
      {options.map((o) => (
        <TouchableOpacity key={o} style={[styles.chip, value === o && styles.chipActive]} onPress={() => onChange(o)}>
          <Text style={[styles.chipText, value === o && styles.chipTextActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { backgroundColor: colors.pitch, padding: spacing.lg },
  headerTitle: { color: "#fff", fontWeight: "700", fontSize: 17 },
  hero: { backgroundColor: colors.pitch, paddingTop: 30, paddingBottom: 26, alignItems: "center" },
  avatarWrap: { marginBottom: 12 },
  name: { color: "#fff", fontWeight: "700", fontSize: 21 },
  subline: { color: "#C9D6F5", fontSize: 13, marginTop: 4 },
  scoreboard: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, marginTop: 18, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  statCell: { flex: 1, paddingVertical: 12, alignItems: "center" },
  statN: { color: colors.lime, fontWeight: "700", fontSize: 19 },
  statL: { color: "#C9D6F5", fontSize: 9.5, textTransform: "uppercase", marginTop: 2 },
  pad: { padding: spacing.lg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  cardLabel: { fontSize: 11, fontWeight: "700", color: colors.slate, textTransform: "uppercase", marginBottom: 6 },
  fieldLabel: { fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", color: colors.slate, marginBottom: 6 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.turf, borderColor: colors.turf },
  chipText: { fontSize: 12.5, fontWeight: "600", color: colors.slate },
  chipTextActive: { color: "#fff" },
});
