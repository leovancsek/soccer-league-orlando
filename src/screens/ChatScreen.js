import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { colors, spacing, radius } from "../theme/theme";

const REPORT_REASONS = ["Spam", "Harassment or abuse", "Inappropriate content", "Other"];

export default function ChatScreen({ route, navigation }) {
  const { conversationId } = route.params;
  const { conversations, sendMessage, markRead, reportUser, blockUser } = useApp();
  const convo = conversations.find((c) => c.id === conversationId);
  const [text, setText] = useState("");

  useEffect(() => { if (convo?.unread) markRead(conversationId); }, [conversationId]);

  if (!convo) return null;

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(conversationId, text.trim());
    setText("");
  };

  const handleReport = () => {
    Alert.alert(
      `Report ${convo.name}?`,
      "What's the issue?",
      [
        ...REPORT_REASONS.map((reason) => ({
          text: reason,
          onPress: async () => {
            const { error } = await reportUser(convo.name, reason);
            if (error) Alert.alert("Couldn't send report", error);
            else Alert.alert("Report submitted", "Thanks — our team will review this.");
          },
        })),
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleBlock = () => {
    Alert.alert(
      `Block ${convo.name}?`,
      "You won't see messages from them anymore. You can unblock them later from the Messages tab.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            const { error } = await blockUser(convo.name);
            if (error) Alert.alert("Couldn't block", error);
            else navigation.goBack();
          },
        },
      ]
    );
  };

  const handleMoreOptions = () => {
    Alert.alert(convo.name, undefined, [
      { text: "Report", onPress: handleReport },
      { text: "Block", style: "destructive", onPress: handleBlock },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{convo.name}</Text>
            <Text style={styles.sub}>{convo.game}</Text>
          </View>
          <TouchableOpacity onPress={handleMoreOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ color: "#fff", fontSize: 20 }}>⋯</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={convo.messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === "me" ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={{ color: item.from === "me" ? "#fff" : colors.ink }}>{item.text}</Text>
              <Text style={styles.bubbleTime}>{item.time}</Text>
            </View>
          )}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message the organizer..." placeholderTextColor={colors.slate}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={{ color: "#fff", fontSize: 16 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  header: { backgroundColor: colors.pitch, padding: spacing.lg, flexDirection: "row", alignItems: "center" },
  title: { color: "#fff", fontWeight: "700", fontSize: 17 },
  sub: { color: "#C9D6F5", fontSize: 11.5, marginTop: 2 },
  bubble: { maxWidth: "75%", padding: 12, borderRadius: 16, marginBottom: 10 },
  bubbleThem: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: colors.turf, alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleTime: { fontSize: 10, color: colors.slate, marginTop: 3 },
  inputBar: { flexDirection: "row", gap: 8, padding: 14, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.chalk },
  input: { flex: 1, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, color: colors.ink },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.turf, alignItems: "center", justifyContent: "center" },
});
