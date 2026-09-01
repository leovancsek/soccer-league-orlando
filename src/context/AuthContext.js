import React, { createContext, useContext, useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data, error }) => { if (!error) setProfile(data); });
  }, [session?.user?.id]);

  // ---- Registration requirements: email, password (min 8 chars), full name ----
  const register = async ({ email, password, name }) => {
    if (!email || !password || !name) {
      return { error: "Name, email, and password are required." };
    }
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }, // consumed by the handle_new_user() trigger
    });
    if (error) return { error: error.message };
    // If email confirmations are enabled in your Supabase project (recommended),
    // data.session will be null here until the user verifies their email.
    return { data };
  };

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { data };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // ---- Password auto-reset: sends a reset-link email via Supabase Auth ----
  const requestPasswordReset = async (email) => {
    const redirectTo = Linking.createURL("reset-password");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { error: error.message };
    return { ok: true };
  };

  // Called from ResetPasswordScreen once the user lands back in-app from the email link.
  const completePasswordReset = async (newPassword) => {
    if (newPassword.length < 8) return { error: "Password must be at least 8 characters." };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { ok: true };
  };

  const value = {
    session,
    profile,
    isLoading: session === undefined,
    isAuthenticated: !!session,
    register,
    login,
    logout,
    requestPasswordReset,
    completePasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
