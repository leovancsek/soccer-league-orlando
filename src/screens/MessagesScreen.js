import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { colors, spacing } from "../theme/theme";
import { Avatar, HeaderLogo } from "../components/Shared";

export default function MessagesScreen({ navigation }) {
  const { conversations, whatsappGroupUrl } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderLogo size={26} />
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(c) => String(c.id)}
        ListHeaderComponent={
          whatsappGroupUrl ? (
            <TouchableOpacity style={styles.waCard} onPress={() => Linking.openURL(whatsappGroupUrl)}>
              <View style={styles.waIcon}><Text style={{ fontSize: 20 }}>📢</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.waTitle}>Join the WhatsApp announcements group</Text>
                <Text style={styles.waSub}>League news and updates from the admin team</Text>
              </View>
              <Text style={styles.waArrow}>›</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={<Text style={styles.empty}>No messages yet. Message an organizer from a game you've booked.</Text>}
        renderItem={({ item }) => {
          const last = item.messages[item.messages.length - 1];
          return (
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("Chat", { conversationId: item.id })}>
              <Avatar name={item.name} size={44} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.time}>{last.time}</Text>
                </View>
                <Text style={styles.game}>{item.game}</Text>
                <Text style={styles.preview} numberOfLines={1}>{last.from === "me" ? "You: " : ""}{last.text}</Text>
              </View>
              {item.unread ? <View style={styles.dot} /> : null}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { backgroundColor: colors.pitch, padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: 10 },
  title: { color: "#fff", fontWeight: "700", fontSize: 19 },
  waCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.lime, borderRadius: 14, margin: spacing.lg, marginBottom: 6, padding: 12, gap: 10 },
  waIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.chalk, alignItems: "center", justifyContent: "center" },
  waTitle: { fontWeight: "700", fontSize: 13.5, color: colors.ink },
  waSub: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
  waArrow: { fontSize: 22, color: colors.slate },
  empty: { textAlign: "center", color: colors.slate, marginTop: 60, paddingHorizontal: 30 },
  row: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderColor: colors.line },
  rowTop: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontWeight: "700", fontSize: 14.5, color: colors.ink },
  time: { fontSize: 11, color: colors.slate },
  game: { fontSize: 11, color: colors.turf, fontWeight: "600", marginTop: 2 },
  preview: { fontSize: 13, color: colors.slate, marginTop: 2 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.lime },
});
