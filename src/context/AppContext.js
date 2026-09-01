import React, { createContext, useContext, useState, useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../lib/supabase";
import {
  initialGames, initialUsers, initialFeatures, initialConversations, initialProfile,
} from "../data/seedData";

const AppContext = createContext(null);

function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// Parses a display price like "$15" or "$45" into integer cents for Stripe.
function priceToCents(priceLabel) {
  const n = parseFloat(String(priceLabel).replace(/[^0-9.]/g, "")) || 0;
  return Math.round(n * 100);
}

export function AppProvider({ children }) {
  const [games, setGames] = useState(initialGames);
  const [users, setUsers] = useState(initialUsers);
  const [features, setFeatures] = useState(initialFeatures);
  const [conversations, setConversations] = useState(initialConversations);
  const [profile, setProfile] = useState(initialProfile);
  const [myBookings, setMyBookings] = useState([]);

  const bookGame = useCallback((gameId) => {
    setGames((gs) => gs.map((g) => (g.id === gameId ? { ...g, spotsFilled: Math.min(g.spotsTotal, g.spotsFilled + 1) } : g)));
    setMyBookings((b) => (b.includes(gameId) ? b : [...b, gameId]));
  }, []);

  // Called after the player chooses a reservation time slot. Reserves the
  // slot immediately (optimistic — feels instant), then redirects to Stripe
  // Checkout to collect payment. If payment fails/cancels, call
  // cancelBooking(gameId) to release the slot again (see PaymentResultScreen).
  const initiatePayment = useCallback(async (game) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: "You must be signed in to book a game." };

    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: {
        gameId: game.id,
        gameTitle: game.title,
        priceLabel: game.price,
        amountCents: priceToCents(game.price),
      },
    });
    if (error) return { error: error.message };

    // Reserve the slot locally right away so the UI reflects it while the
    // user is in the Stripe browser tab.
    setGames((gs) => gs.map((g) => (g.id === game.id ? { ...g, spotsFilled: Math.min(g.spotsTotal, g.spotsFilled + 1) } : g)));
    setMyBookings((b) => (b.includes(game.id) ? b : [...b, game.id]));

    const result = await WebBrowser.openAuthSessionAsync(data.url, "soccerleagueorlando://payment-success");
    if (result.type !== "success") {
      // User backed out of checkout — release the slot again.
      setGames((gs) => gs.map((g) => (g.id === game.id ? { ...g, spotsFilled: Math.max(0, g.spotsFilled - 1) } : g)));
      setMyBookings((b) => b.filter((id) => id !== game.id));
      return { cancelled: true };
    }
    return { ok: true, bookingId: data.bookingId };
  }, []);

  const cancelBooking = useCallback((gameId) => {
    setGames((gs) => gs.map((g) => (g.id === gameId ? { ...g, spotsFilled: Math.max(0, g.spotsFilled - 1) } : g)));
    setMyBookings((b) => b.filter((id) => id !== gameId));
  }, []);

  const toggleUserStatus = useCallback((id) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u)));
  }, []);

  const toggleFeature = useCallback((id) => {
    setFeatures((fs) => fs.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  }, []);

  const addRosterPlayer = useCallback((gameId, rosterKey, name) => {
    setGames((gs) => gs.map((g) => {
      if (g.id !== gameId || g.spotsFilled >= g.spotsTotal) return g;
      return {
        ...g,
        [rosterKey]: [...g[rosterKey], name],
        players: [...g.players, initials(name)],
        spotsFilled: Math.min(g.spotsTotal, g.spotsFilled + 1),
      };
    }));
  }, []);

  const removeRosterPlayer = useCallback((gameId, rosterKey, name) => {
    setGames((gs) => gs.map((g) => {
      if (g.id !== gameId) return g;
      const idx = g.players.indexOf(initials(name));
      const players = [...g.players];
      if (idx > -1) players.splice(idx, 1);
      return {
        ...g,
        [rosterKey]: g[rosterKey].filter((n) => n !== name),
        players,
        spotsFilled: Math.max(0, g.spotsFilled - 1),
      };
    }));
  }, []);

  const deleteGame = useCallback((id) => {
    setGames((gs) => gs.filter((g) => g.id !== id));
    setMyBookings((b) => b.filter((x) => x !== id));
  }, []);

  const saveGame = useCallback((gameId, fields) => {
    if (gameId) {
      setGames((gs) => gs.map((g) => (g.id === gameId ? { ...g, ...fields } : g)));
    } else {
      setGames((gs) => {
        const newId = Math.max(0, ...gs.map((g) => g.id)) + 1;
        return [{
          id: newId, spotsFilled: 0, players: [],
          dropIns: [], monthlyPlayers: [], leaguePlayers: [], substitutes: [],
          organizer: { name: profile.name, rating: 5.0 },
          ...fields,
        }, ...gs];
      });
    }
  }, [profile.name]);

  const sendMessage = useCallback((conversationId, text) => {
    setConversations((cs) => cs.map((c) => {
      if (c.id !== conversationId) return c;
      return { ...c, unread: false, messages: [...c.messages, { from: "me", text, time: "Now" }] };
    }));
    setTimeout(() => {
      setConversations((cs) => cs.map((c) => {
        if (c.id !== conversationId) return c;
        return { ...c, messages: [...c.messages, { from: "them", text: "Got it, thanks for the message! 👍", time: "Now" }] };
      }));
    }, 900);
  }, []);

  const markRead = useCallback((conversationId) => {
    setConversations((cs) => cs.map((c) => (c.id === conversationId ? { ...c, unread: false } : c)));
  }, []);

  const openOrCreateConversation = useCallback((game) => {
    let convo = null;
    setConversations((cs) => {
      convo = cs.find((c) => c.name === game.organizer.name);
      if (convo) return cs;
      const newConvo = {
        id: cs.length + 1, name: game.organizer.name, game: game.title, unread: false,
        messages: [{ from: "them", text: "Hi! Let me know if you have any questions about the game.", time: "Now" }],
      };
      convo = newConvo;
      return [...cs, newConvo];
    });
    return convo;
  }, []);

  const value = {
    games, users, features, conversations, profile, myBookings,
    setProfile, bookGame, initiatePayment, cancelBooking, toggleUserStatus, toggleFeature,
    addRosterPlayer, removeRosterPlayer, deleteGame, saveGame,
    sendMessage, markRead, openOrCreateConversation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
