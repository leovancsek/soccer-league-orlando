import React, { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Switch, Alert, Platform } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, spacing, radius } from "../theme/theme";
import { Avatar, Button } from "../components/Shared";
import { ROSTER_CONFIG } from "../data/seedData";

export default function AdminScreen({ navigation }) {
  const { games, users, features, toggleUserStatus, toggleFeature, addRosterPlayer, removeRosterPlayer, deleteGame } = useApp();
  const [section, setSection] = useState("games");
  const activeUsers = users.filter((u) => u.status === "active").length;
  const enabledFeatures = features.filter((f) => f.enabled).length;

  const promptAddPlayer = (gameId, rosterDef) => {
    if (Platform.OS === "ios") {
      Alert.prompt(rosterDef.label, "Full name", (name) => {
        if (name && name.trim()) addRosterPlayer(gameId, rosterDef.key, name.trim());
      });
    } else {
      // Android has no built-in text-prompt Alert; a real app would use a Modal + TextInput here.
      Alert.alert(rosterDef.label, "Adding players on Android uses an in-app form modal — same addRosterPlayer() call as iOS.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin</Text>
        <Text style={styles.sub}>Manage games, users and platform features</Text>
        <View style={styles.segment}>
          {["games", "users", "features"].map((s) => (
            <TouchableOpacity key={s} style={[styles.segBtn, section === s && styles.segBtnActive]} onPress={() => setSection(s)}>
              <Text style={[styles.segText, section === s && styles.segTextActive]}>{s[0].toUpperCase() + s.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatBox n={games.length} l="Total games" />
        <StatBox n={activeUsers} l="Active users" />
        <StatBox n={`${enabledFeatures}/${features.length}`} l="Features on" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {section === "games" && (
          <>
            <Button
              title="+ Create game or tournament"
              variant="turf"
              style={{ marginHorizontal: spacing.lg, marginTop: 6, marginBottom: 4 }}
              onPress={() => navigation.navigate("GameForm", { gameId: null })}
            />
            {games.map((g) => {
              const left = g.spotsTotal - g.spotsFilled;
              const pct = Math.min(100, Math.round((g.spotsFilled / g.spotsTotal) * 100));
              const rosters = ROSTER_CONFIG[g.listingType || "casual"];
              return (
                <View key={g.id} style={styles.gameCard}>
                  {g.image ? <Image source={{ uri: g.image }} style={styles.gameImg} /> : (
                    <View style={styles.noImg}><Text style={{ color: "rgba(255,255,255,0.7)" }}>📷 No field photo yet</Text></View>
                  )}
                  <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={styles.gameTitle}>{g.title}</Text>
                      <View style={[styles.typePill, { backgroundColor: g.listingType === "league" ? colors.turf : colors.slate }]}>
                        <Text style={styles.typePillText}>{g.listingType === "league" ? "League" : "Casual"}</Text>
                      </View>
                    </View>
                    <Text style={styles.gameMeta}>{g.format} · {g.venue} · {g.date} · {g.time}</Text>

                    <View style={{ marginTop: 10 }}>
                      <View style={styles.slotsLabelRow}>
                        <Text style={styles.slotsLabel}>Slots filled</Text>
                        <Text style={styles.slotsValue}>{g.spotsFilled}/{g.spotsTotal} · {left} available</Text>
                      </View>
                      <View style={styles.track}>
                        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: left <= 0 ? colors.warn : colors.turf }]} />
                      </View>
                    </View>

                    {rosters.map((r) => (
                      <View key={r.key} style={styles.rosterGroup}>
                        <View style={styles.rosterHead}>
                          <Text style={styles.rosterTitle}>{r.label}</Text>
                          <Text style={styles.rosterFee}>{(g.pricing && g.pricing[r.priceKey]) || "—"}{r.unit}</Text>
                        </View>
                        <Text style={styles.rosterSub}>{r.sub}</Text>
                        <View style={styles.chipsRow}>
                          {(g[r.key] || []).map((name) => (
                            <View key={name} style={styles.mpChip}>
                              <Avatar name={name} size={20} />
                              <Text style={styles.mpChipText}>{name}</Text>
                              <TouchableOpacity onPress={() => removeRosterPlayer(g.id, r.key, name)}>
                                <Text style={{ color: colors.turf, fontSize: 13 }}> ✕</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                          <TouchableOpacity style={styles.addChip} onPress={() => promptAddPlayer(g.id, r)}>
                            <Text style={styles.addChipText}>+ Add player</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                      <Button title="Edit" variant="outline" style={{ flex: 1, paddingVertical: 9 }} onPress={() => navigation.navigate("GameForm", { gameId: g.id })} />
                      <Button
                        title="Delete"
                        variant="danger"
                        style={{ flex: 1, paddingVertical: 9 }}
                        onPress={() => Alert.alert("Delete listing?", `"${g.title}" can't be undone.`, [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => deleteGame(g.id) },
                        ])}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {section === "users" && users.map((u) => (
          <View key={u.id} style={[styles.userRow, u.status === "suspended" && { opacity: 0.6 }]}>
            <Avatar name={u.name} size={40} bg={u.status === "suspended" ? colors.slate : colors.turf} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontWeight: "700" }}>{u.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: u.status === "active" ? "#E3EBFC" : "#FBE9E5" }]}>
                  <Text style={{ fontSize: 9.5, fontWeight: "700", color: u.status === "active" ? colors.turf : colors.warn, textTransform: "uppercase" }}>{u.status}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: colors.slate, marginTop: 1 }}>{u.email}</Text>
              <Text style={{ fontSize: 11, color: colors.slate, marginTop: 2 }}>Joined {u.joined} · {u.gamesPlayed} games played</Text>
            </View>
            <Button
              title={u.status === "active" ? "Disable" : "Enable"}
              variant={u.status === "active" ? "danger" : "outline"}
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}
              onPress={() => toggleUserStatus(u.id)}
            />
          </View>
        ))}

        {section === "features" && features.map((f) => (
          <View key={f.id} style={[styles.featureRow, !f.enabled && { opacity: 0.5 }]}>
            <View style={styles.featureIc}><Text style={{ fontSize: 17 }}>{f.icon}</Text></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: "700" }}>{f.name}</Text>
              <Text style={{ fontSize: 12, color: colors.slate, marginTop: 2 }}>{f.desc}</Text>
            </View>
            <Switch value={f.enabled} onValueChange={() => toggleFeature(f.id)} trackColor={{ true: colors.turf }} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ n, l }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { backgroundColor: colors.pitch, padding: spacing.lg },
  title: { color: "#fff", fontWeight: "700", fontSize: 19 },
  sub: { color: "#C9D6F5", fontSize: 12.5, marginTop: 2 },
  segment: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 4, marginTop: 14, gap: 4 },
  segBtn: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 9 },
  segBtnActive: { backgroundColor: colors.lime },
  segText: { fontSize: 12.5, fontWeight: "700", color: "#C9D6F5" },
  segTextActive: { color: colors.pitch },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: spacing.lg, paddingTop: 14 },
  statBox: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, alignItems: "center" },
  statN: { fontWeight: "700", fontSize: 19, color: colors.turf },
  statL: { fontSize: 9.5, color: colors.slate, textTransform: "uppercase", marginTop: 2 },
  gameCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, marginHorizontal: spacing.lg, marginTop: 14, overflow: "hidden" },
  gameImg: { width: "100%", height: 110 },
  noImg: { width: "100%", height: 70, backgroundColor: colors.turf, alignItems: "center", justifyContent: "center" },
  gameTitle: { fontWeight: "700", fontSize: 15 },
  typePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typePillText: { color: "#fff", fontSize: 9.5, fontWeight: "700", textTransform: "uppercase" },
  gameMeta: { fontSize: 12, color: colors.slate, marginTop: 2 },
  slotsLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  slotsLabel: { fontSize: 11.5, color: colors.slate, fontWeight: "600" },
  slotsValue: { fontSize: 11.5, fontWeight: "700", color: colors.ink },
  track: { height: 7, borderRadius: 6, backgroundColor: colors.line, marginTop: 5, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 6 },
  rosterGroup: { marginTop: 14, paddingTop: 12, borderTopWidth: 1.5, borderColor: colors.line, borderStyle: "dashed" },
  rosterHead: { flexDirection: "row", justifyContent: "space-between" },
  rosterTitle: { fontWeight: "700", fontSize: 13.5 },
  rosterFee: { fontWeight: "700", fontSize: 13, color: colors.turf },
  rosterSub: { fontSize: 11, color: colors.slate },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  mpChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EEF2FE", borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 },
  mpChipText: { fontSize: 11.5, fontWeight: "600", color: colors.turf },
  addChip: { borderWidth: 1.5, borderColor: colors.line, borderStyle: "dashed", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  addChipText: { fontSize: 11.5, fontWeight: "700", color: colors.slate },
  userRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, marginHorizontal: spacing.lg, marginTop: 10, padding: 12 },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  featureRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 14, marginHorizontal: spacing.lg, marginTop: 10, padding: 14 },
  featureIc: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#E9EEFC", alignItems: "center", justifyContent: "center" },
});
