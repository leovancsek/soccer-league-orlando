import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { colors, spacing, radius } from "../theme/theme";
import { Avatar, Badge, Button } from "../components/Shared";
import { ROSTER_CONFIG } from "../data/seedData";
import { useLocale } from "../i18n/LocaleContext";

export default function GameDetailScreen({ route, navigation }) {
  const { t } = useLocale();
  const { gameId } = route.params;
  const { games, myBookings, initiatePayment, openOrCreateConversation } = useApp();
  const { profile } = useAuth();
  const game = games.find((g) => g.id === gameId);
  const [paying, setPaying] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  if (!game) return null;

  const reservableCap = game.reservableSlots ?? game.spotsTotal;
  const left = reservableCap - game.spotsFilled;
  const full = left <= 0;
  const booked = myBookings.includes(game.id);
  const rosters = ROSTER_CONFIG[game.listingType || "casual"];

  const handleMessage = () => {
    const convo = openOrCreateConversation(game);
    navigation.navigate("Messages", { screen: "Chat", params: { conversationId: convo.id } });
  };

  const handleBookAndPay = async () => {
    if (!profile?.waiver_accepted) {
      navigation.navigate("SignWaiver");
      return;
    }
    setPaying(true);
    const result = await initiatePayment(game, discountCode.trim());
    setPaying(false);
    if (result.error) Alert.alert(t("gameDetail.couldntStartCheckout"), result.error);
    else if (result.cancelled) Alert.alert(t("gameDetail.checkoutCancelledTitle"), t("gameDetail.checkoutCancelledBody"));
    else Alert.alert(t("gameDetail.bookedTitle"), t("gameDetail.bookedBody"));
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
            <InfoLine label={t("gameDetail.venue")} value={`${game.venue}\n${game.address}`} />
            <InfoLine label={t("gameDetail.dateTime")} value={`${game.date} · ${game.time}`} />
            <InfoLine label={t("gameDetail.pricePerPlayer")} value={game.price} />
            <InfoLine label={t("gameDetail.skillLevel")} value={game.level} last />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>{game.listingType === "league" ? t("gameDetail.playerCostsLeague") : t("gameDetail.playerCostsCasual")}</Text>
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
                  <Text style={{ fontWeight: "700", color: colors.ink }}>{game.organizer.name}</Text>
                  <Text style={{ color: colors.slate, fontSize: 12 }}>{t("gameDetail.organizerRating", game.organizer.rating)}</Text>
                </View>
              </View>
              <Button title={t("common.message")} variant="outline" style={{ paddingHorizontal: 16, paddingVertical: 9 }} onPress={handleMessage} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t("gameDetail.playersJoined", game.spotsFilled, game.spotsTotal)}</Text>
            <View style={styles.playersGrid}>
              {game.players.map((p, i) => (
                <View key={i} style={styles.playerChip}><Avatar name={p} size={40} /></View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyBar}>
        {!booked && !full && (
          <TextInput
            style={styles.discountInput}
            placeholder={t("gameDetail.discountCodePlaceholder")}
            placeholderTextColor={colors.slate}
            autoCapitalize="characters"
            autoCorrect={false}
            value={discountCode}
            onChangeText={setDiscountCode}
          />
        )}
        {booked ? (
          <Button title={t("gameDetail.bookedIn")} variant="outline" disabled style={{ width: "100%" }} />
        ) : full ? (
          <Button title={t("gameDetail.gameFull")} variant="ghost" disabled style={{ width: "100%", backgroundColor: colors.line }} />
        ) : paying ? (
          <View style={{ width: "100%", alignItems: "center", paddingVertical: 14 }}><ActivityIndicator color={colors.turf} /></View>
        ) : (
          <Button
            title={profile?.waiver_accepted ? t("gameDetail.bookSlot", game.price) : t("gameDetail.signWaiverToBook")}
            onPress={handleBookAndPay}
            style={{ width: "100%" }}
          />
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
  hero: { backgroundColor: colors.pitch, padding: spacing.lg, paddingBottom: 26 },
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
  discountInput: { borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: colors.ink, backgroundColor: colors.card, marginBottom: 10, fontSize: 13 },
});
