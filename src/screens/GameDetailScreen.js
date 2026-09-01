import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, spacing, radius } from "../theme/theme";
import { Avatar, Badge, Button } from "../components/Shared";
import { ROSTER_CONFIG } from "../data/seedData";

export default function GameDetailScreen({ route, navigation }) {
  const { gameId } = route.params;
  const { games, myBookings, initiatePayment, openOrCreateConversation } = useApp();
  const game = games.find((g) => g.id === gameId);
  const [paying, setPaying] = useState(false);
  if (!game) return null;

  const left = game.spotsTotal - game.spotsFilled;
  const full = left <= 0;
  const booked = myBookings.includes(game.id);
  const rosters = ROSTER_CONFIG[game.listingType || "casual"];

  const handleMessage = () => {
    const convo = openOrCreateConversation(game);
    navigation.navigate("Messages", { screen: "Chat", params: { conversationId: convo.id } });
  };

  const handleBookAndPay = async () => {
    setPaying(true);
    const result = await initiatePayment(game);
    setPaying(false);
    if (result.error) Alert.alert("Couldn't start checkout", result.error);
    else if (result.cancelled) Alert.alert("Checkout cancelled", "Your slot wasn't charged, so it's been released.");
    else Alert.alert("You're in!", "Payment received — see you on the pitch.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {game.image ? <Image source={{ uri: game.image }} style={styles.banner} /> : null}
        <View style={styles.hero}>
          <Badge bg={colors.lime} color={colors.pitch}>{game.format} · {game.level}{game.listingType === "league" ? " · League" : " · Casual"}</Badge>
          <Text style={styles.heroTitle}>{game.title}</Text>
          <Text style={styles.heroSub}>📍 {game.venue}</Text>
        </View>

        <View style={styles.pad}>
          <View style={styles.card}>
            <InfoLine label="Venue" value={`${game.venue}\n${game.address}`} />
            <InfoLine label="Date & Time" value={`${game.date} · ${game.time}`} />
            <InfoLine label="Price per player" value={game.price} />
            <InfoLine label="Skill level" value={game.level} last />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Player costs {game.listingType === "league" ? "— League" : "— Casual"}</Text>
            {rosters.map((r) => (
              <View key={r.key} style={styles.costRow}>
                <Text style={styles.costLabel}>{r.label}</Text>
                <Text style={styles.costValue}>{(game.pricing && game.pricing[r.priceKey]) || "—"}{r.unit} · {r.sub}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.orgHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Avatar name={game.organizer.name} size={38} />
                <View>
                  <Text style={{ fontWeight: "700" }}>{game.organizer.name}</Text>
                  <Text style={{ color: colors.slate, fontSize: 12 }}>★ {game.organizer.rating} organizer rating</Text>
                </View>
              </View>
              <Button title="Message" variant="outline" style={{ paddingHorizontal: 16, paddingVertical: 9 }} onPress={handleMessage} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Players joined ({game.spotsFilled}/{game.spotsTotal})</Text>
            <View style={styles.playersGrid}>
              {game.players.map((p, i) => (
                <View key={i} style={styles.playerChip}><Avatar name={p} size={40} /></View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        {booked ? (
          <Button title="✓ You're booked in" variant="outline" disabled style={{ flex: 1 }} />
        ) : full ? (
          <Button title="Game is full" variant="ghost" disabled style={{ flex: 1, backgroundColor: colors.line }} />
        ) : paying ? (
          <View style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}><ActivityIndicator color={colors.turf} /></View>
        ) : (
          <Button title={`Book this slot — pay ${game.price}`} onPress={handleBookAndPay} style={{ flex: 1 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

function InfoLine({ label, value, last }) {
  return (
    <View style={[styles.infoLine, !last && styles.infoLineBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  banner: { width: "100%", height: 190 },
  hero: { backgroundColor: colors.turf, padding: spacing.lg, paddingBottom: 26 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 8 },
  heroSub: { color: "#DCE6F5", fontSize: 13, marginTop: 5 },
  pad: { padding: spacing.lg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  cardLabel: { fontSize: 11, fontWeight: "700", color: colors.slate, textTransform: "uppercase", marginBottom: 8 },
  infoLine: { paddingVertical: 8 },
  infoLineBorder: { borderBottomWidth: 1, borderColor: colors.line },
  infoLabel: { fontSize: 11, color: colors.slate, textTransform: "uppercase", fontWeight: "600" },
  infoValue: { fontSize: 14, marginTop: 2, fontWeight: "500", color: colors.ink },
  costRow: { paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.line },
  costLabel: { fontWeight: "700", fontSize: 13.5, color: colors.ink },
  costValue: { fontSize: 12, color: colors.slate, marginTop: 2 },
  orgHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  playersGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  playerChip: { alignItems: "center" },
  stickyBar: { padding: spacing.lg, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.chalk },
});
