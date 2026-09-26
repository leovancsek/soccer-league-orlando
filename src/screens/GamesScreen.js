import React, { useState, useMemo } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useLocale } from "../i18n/LocaleContext";
import { colors, spacing, radius } from "../theme/theme";
import { TicketCard, Button, HeaderLogo } from "../components/Shared";

const WEEK_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PAGE_SIZE = 3;

export default function GamesScreen({ navigation }) {
  const { games } = useApp();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Game.date strings are like "Tue, Aug 25" — the leading weekday
  // abbreviation is exactly what we filter and display pills for.
  const dayOf = (game) => game.date.slice(0, 3);
  const dayKey = { Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun" };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return games.filter((g) => {
      const matchesDay = filter === "all" || dayOf(g) === filter;
      const matchesQ = !q || g.venue.toLowerCase().includes(q) || g.address.toLowerCase().includes(q) || g.title.toLowerCase().includes(q);
      return matchesDay && matchesQ;
    });
  }, [games, query, filter]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <HeaderLogo size={28} />
          <Text style={styles.brand}>Soccer League Orlando</Text>
        </View>
        <View style={styles.pill}><Text style={styles.pillText}>📍 {t("games.location")}</Text></View>
        <View style={styles.searchBar}>
          <TextInput
            placeholder={t("games.searchPlaceholder")}
            placeholderTextColor={colors.slate}
            style={styles.searchInput}
            value={query}
            onChangeText={(t) => { setQuery(t); setVisible(PAGE_SIZE); }}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ paddingHorizontal: spacing.lg, alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => { setFilter("all"); setVisible(PAGE_SIZE); }}
          style={[styles.chip, filter === "all" && styles.chipActive]}
        >
          <Text style={[styles.chipText, filter === "all" && styles.chipTextActive]}>{t("games.allDays")}</Text>
        </TouchableOpacity>
        {WEEK_ORDER.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => { setFilter(d); setVisible(PAGE_SIZE); }}
            style={[styles.chip, filter === d && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === d && styles.chipTextActive]}>{t(`days.${dayKey[d]}`)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={shown}
        keyExtractor={(g) => String(g.id)}
        renderItem={({ item }) => (
          <TicketCard game={item} onPress={() => navigation.navigate("GameDetail", { gameId: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t("games.noResults")}</Text>}
        ListFooterComponent={remaining > 0 ? (
          <Button
            title={t("games.showMore", Math.min(remaining, PAGE_SIZE), Math.min(remaining, PAGE_SIZE) !== 1)}
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
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { color: "#fff", fontWeight: "700", fontSize: 17 },
  pill: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  pillText: { color: "#C9D6F5", fontSize: 12.5 },
  searchBar: { marginTop: 14, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: radius.md, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  searchInput: { color: "#fff", fontSize: 14, paddingVertical: 10 },
  chipRow: { marginTop: 12, marginBottom: 4, flexGrow: 0, height: 44 },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.line, marginRight: 8, justifyContent: "center" },
  chipActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  chipText: { fontSize: 12.5, fontWeight: "600", color: colors.slate },
  chipTextActive: { color: colors.pitch },
  empty: { textAlign: "center", color: colors.slate, marginTop: 60, paddingHorizontal: 30 },
});
