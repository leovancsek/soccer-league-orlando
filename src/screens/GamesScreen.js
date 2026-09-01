import React, { useState, useMemo } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, spacing, radius } from "../theme/theme";
import { TicketCard, Button } from "../components/Shared";

const FORMATS = ["all", "5v5", "7v7", "11v11"];
const PAGE_SIZE = 3;

export default function GamesScreen({ navigation }) {
  const { games } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return games.filter((g) => {
      const matchesFmt = filter === "all" || g.format === filter;
      const matchesQ = !q || g.venue.toLowerCase().includes(q) || g.address.toLowerCase().includes(q) || g.title.toLowerCase().includes(q);
      return matchesFmt && matchesQ;
    });
  }, [games, query, filter]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>⚽ Soccer League Orlando</Text>
        <View style={styles.pill}><Text style={styles.pillText}>📍 Orlando, FL</Text></View>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search by venue or neighborhood..."
            placeholderTextColor="#8FA3D4"
            style={styles.searchInput}
            value={query}
            onChangeText={(t) => { setQuery(t); setVisible(PAGE_SIZE); }}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
        {FORMATS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => { setFilter(f); setVisible(PAGE_SIZE); }}
            style={[styles.chip, filter === f && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f === "all" ? "All formats" : f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={shown}
        keyExtractor={(g) => String(g.id)}
        renderItem={({ item }) => (
          <TicketCard game={item} onPress={() => navigation.navigate("GameDetail", { gameId: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No games found. Try a different neighborhood or format.</Text>}
        ListFooterComponent={remaining > 0 ? (
          <Button
            title={`Show ${Math.min(remaining, PAGE_SIZE)} more game${remaining === 1 ? "" : "s"}`}
            variant="outline"
            style={{ marginHorizontal: spacing.lg, marginBottom: 20 }}
            onPress={() => setVisible((v) => v + PAGE_SIZE)}
          />
        ) : <View style={{ height: 20 }} />}
        contentContainerStyle={{ paddingTop: 4 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { backgroundColor: colors.pitch, padding: spacing.lg, paddingBottom: 14 },
  brand: { color: "#fff", fontWeight: "700", fontSize: 17 },
  pill: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  pillText: { color: "#C9D6F5", fontSize: 12.5 },
  searchBar: { marginTop: 14, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: radius.md, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  searchInput: { color: "#fff", fontSize: 14, paddingVertical: 10 },
  chipRow: { marginTop: 12, marginBottom: 4, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, marginRight: 8 },
  chipActive: { backgroundColor: colors.turf, borderColor: colors.turf },
  chipText: { fontSize: 12.5, fontWeight: "600", color: colors.slate },
  chipTextActive: { color: "#fff" },
  empty: { textAlign: "center", color: colors.slate, marginTop: 60, paddingHorizontal: 30 },
});
