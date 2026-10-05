import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { colors, spacing } from "../theme/theme";
import { TicketCard, Button, HeaderLogo } from "../components/Shared";
import { useLocale } from "../i18n/LocaleContext";

export default function BookingsScreen({ navigation }) {
  const { t } = useLocale();
  const { games, myBookings, cancelBooking, openOrCreateConversation } = useApp();
  const booked = myBookings.map((id) => games.find((g) => g.id === id)).filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderLogo size={26} />
        <Text style={styles.title}>{t("bookings.title")}</Text>
      </View>
      <FlatList
        data={booked}
        keyExtractor={(g) => String(g.id)}
        ListEmptyComponent={<Text style={styles.empty}>{t("bookings.empty")}</Text>}
        renderItem={({ item }) => (
          <View>
            <TicketCard game={item} onPress={() => navigation.navigate("Games", { screen: "GameDetail", params: { gameId: item.id } })} />
            <View style={styles.actions}>
              <Button
                title={t("common.message")}
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => {
                  const convo = openOrCreateConversation(item);
                  navigation.navigate("Messages", { screen: "Chat", params: { conversationId: convo.id } });
                }}
              />
              <Button title={t("common.cancel")} variant="danger" style={{ flex: 1 }} onPress={() => cancelBooking(item.id)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { backgroundColor: colors.pitch, padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: 10 },
  title: { color: "#fff", fontWeight: "700", fontSize: 19 },
  empty: { textAlign: "center", color: colors.slate, marginTop: 60, paddingHorizontal: 30 },
  actions: { flexDirection: "row", gap: 10, marginHorizontal: spacing.lg, marginTop: -4, marginBottom: 14 },
});
