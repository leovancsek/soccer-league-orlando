import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, spacing, radius } from "../theme/theme";

export default function ChatScreen({ route }) {
  const { conversationId } = route.params;
  const { conversations, sendMessage, markRead } = useApp();
  const convo = conversations.find((c) => c.id === conversationId);
  const [text, setText] = useState("");

  useEffect(() => { if (convo?.unread) markRead(conversationId); }, [conversationId]);

  if (!convo) return null;

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(conversationId, text.trim());
    setText("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>{convo.name}</Text>
          <Text style={styles.sub}>{convo.game}</Text>
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
            placeholder="Message the organizer..."
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
  header: { backgroundColor: colors.pitch, padding: spacing.lg },
  title: { color: "#fff", fontWeight: "700", fontSize: 17 },
  sub: { color: "#C9D6F5", fontSize: 11.5, marginTop: 2 },
  bubble: { maxWidth: "75%", padding: 12, borderRadius: 16, marginBottom: 10 },
  bubbleThem: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: colors.turf, alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleTime: { fontSize: 10, color: colors.slate, marginTop: 3 },
  inputBar: { flexDirection: "row", gap: 8, padding: 14, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.chalk },
  input: { flex: 1, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.turf, alignItems: "center", justifyContent: "center" },
});
