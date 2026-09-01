import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { colors, radius, spacing } from "../theme/theme";

export function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function Avatar({ name, size = 36, bg = colors.turf, color = "#fff" }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={{ color, fontWeight: "700", fontSize: size * 0.34 }}>{initials(name)}</Text>
    </View>
  );
}

export function Badge({ children, bg = colors.turf, color = "#fff", style }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={{ color, fontWeight: "700", fontSize: 11 }}>{children}</Text>
    </View>
  );
}

export function Button({ title, onPress, variant = "primary", style, disabled }) {
  const variants = {
    primary: { bg: colors.lime, color: colors.pitch },
    turf: { bg: colors.turf, color: "#fff" },
    outline: { bg: "transparent", color: colors.turf, borderColor: colors.turf },
    danger: { bg: "transparent", color: colors.warn, borderColor: colors.warn },
    ghost: { bg: "transparent", color: colors.slate },
  };
  const v = variants[variant];
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.borderColor || "transparent", opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <Text style={{ color: v.color, fontWeight: "700", fontSize: 14 }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function TicketCard({ game, onPress }) {
  const left = game.spotsTotal - game.spotsFilled;
  const full = left <= 0;
  const low = left <= 2 && left > 0;
  return (
    <TouchableOpacity style={styles.ticket} onPress={onPress} activeOpacity={0.85}>
      {game.image ? <Image source={{ uri: game.image }} style={styles.ticketImg} /> : null}
      <View style={styles.ticketTop}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Badge bg={game.listingType === "league" ? colors.lime : colors.turf} color={game.listingType === "league" ? colors.pitch : "#fff"}>
              {game.format}{game.listingType === "league" ? " · League" : ""}
            </Badge>
            <Text style={styles.title}>{game.title}</Text>
            <Text style={styles.muted}>📍 {game.venue}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.spotsNum, (low || full) && { color: colors.warn }]}>
              {full ? "FULL" : `${left}/${game.spotsTotal}`}
            </Text>
            <Text style={styles.spotsLbl}>{full ? "no spots" : "spots left"}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.day}>{game.date}</Text>
            <Text style={styles.time}>{game.time}</Text>
          </View>
          <Text style={styles.price}>{game.price}</Text>
        </View>
      </View>
      <View style={styles.ticketBottom}>
        <View style={styles.orgRow}>
          <Avatar name={game.organizer.name} size={26} />
          <Text style={styles.orgText}>{game.organizer.name} · ★ {game.organizer.rating}</Text>
        </View>
        <Text style={styles.levelTag}>{game.level}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  btn: { paddingVertical: 14, borderRadius: radius.md, alignItems: "center", borderWidth: 1.5 },
  ticket: { backgroundColor: colors.card, marginHorizontal: spacing.lg, marginVertical: 8, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  ticketImg: { width: "100%", height: 120 },
  ticketTop: { padding: 14 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "700", color: colors.ink },
  muted: { color: colors.slate, fontSize: 12.5, marginTop: 3 },
  spotsNum: { fontWeight: "700", fontSize: 15, color: colors.ink },
  spotsLbl: { fontSize: 10, color: colors.slate, textTransform: "uppercase" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: colors.line, borderStyle: "dashed" },
  day: { fontSize: 10, color: colors.slate, textTransform: "uppercase" },
  time: { fontSize: 13, fontWeight: "700", color: colors.pitch },
  price: { fontSize: 15, fontWeight: "700", color: colors.turf },
  ticketBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#FBFCF9" },
  orgRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  orgText: { fontSize: 12.5, color: colors.slate },
  levelTag: { fontSize: 11, color: colors.slate, fontWeight: "600" },
});
