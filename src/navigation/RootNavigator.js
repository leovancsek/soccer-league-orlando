import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";

import GamesScreen from "../screens/GamesScreen";
import GameDetailScreen from "../screens/GameDetailScreen";
import BookingsScreen from "../screens/BookingsScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ChatScreen from "../screens/ChatScreen";
import AdminScreen from "../screens/AdminScreen";
import GameFormScreen from "../screens/GameFormScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/theme";

const Tab = createBottomTabNavigator();
const GamesStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function GamesStackScreen() {
  return (
    <GamesStack.Navigator screenOptions={{ headerShown: false }}>
      <GamesStack.Screen name="GamesList" component={GamesScreen} />
      <GamesStack.Screen name="GameDetail" component={GameDetailScreen} />
    </GamesStack.Navigator>
  );
}
function MessagesStackScreen() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen name="MessagesList" component={MessagesScreen} />
      <MessagesStack.Screen name="Chat" component={ChatScreen} />
    </MessagesStack.Navigator>
  );
}
function AdminStackScreen() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminHome" component={AdminScreen} />
      <AdminStack.Screen name="GameForm" component={GameFormScreen} />
    </AdminStack.Navigator>
  );
}

const ICONS = { Games: "⚽", Bookings: "📅", Messages: "💬", Admin: "🛡️", Profile: "👤" };

function MainTabs() {
  const { conversations } = useApp();
  const hasUnread = conversations.some((c) => c.unread);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.turf,
        tabBarInactiveTintColor: colors.slate,
        tabBarStyle: { borderTopColor: colors.line },
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
        tabBarBadge: route.name === "Messages" && hasUnread ? " " : undefined,
        tabBarBadgeStyle: { backgroundColor: colors.warn, minWidth: 9, height: 9, borderRadius: 5 },
      })}
    >
      <Tab.Screen name="Games" component={GamesStackScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Messages" component={MessagesStackScreen} />
      <Tab.Screen name="Admin" component={AdminStackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// Maps the deep links Supabase/Stripe redirect back into, e.g.
// soccerleagueorlando://reset-password  ->  AuthStack.ResetPassword
const linking = {
  prefixes: [Linking.createURL("/"), "soccerleagueorlando://"],
  config: {
    screens: {
      ResetPassword: "reset-password",
    },
  },
};

export default function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.chalk }}>
        <ActivityIndicator size="large" color={colors.turf} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
