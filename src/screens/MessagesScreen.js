import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, spacing } from "../theme/theme";
import { Avatar } from "../components/Shared";

export default function MessagesScreen({ navigation }) {
  const { conversations } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Messages</Text></View>
      <FlatList
        data={conversations}
        keyExtractor={(c) => String(c.id)}
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
  header: { backgroundColor: colors.pitch, padding: spacing.lg },
  title: { color: "#fff", fontWeight: "700", fontSize: 19 },
  empty: { textAlign: "center", color: colors.slate, marginTop: 60, paddingHorizontal: 30 },
  row: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderColor: colors.line },
  rowTop: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontWeight: "700", fontSize: 14.5 },
  time: { fontSize: 11, color: colors.slate },
  game: { fontSize: 11, color: colors.turf, fontWeight: "600", marginTop: 2 },
  preview: { fontSize: 13, color: colors.slate, marginTop: 2 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.lime },
});
