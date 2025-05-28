import React from "react";
import { Tabs, Redirect } from "expo-router";
import { Octicons, FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function UserLayout() {
  const { user, loading } = useAuth();

  // Si está cargando, muestra un indicador de carga
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#E4AB1C" />
      </View>
    );
  }

  // Si no hay usuario o es una cuenta business, redirige a la página principal
  if (!user || user.accountType === 'business') {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        ///tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#171615",
        },
        tabBarActiveTintColor: "#E4AB1C",
        tabBarInactiveTintColor: "#FFFFFF",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size} color={color} />
          ),
        }}
      />
<Tabs.Screen
        name="collection"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="person" size={size} color={color} />
          ),
        }}
      />
      
    </Tabs>
  );
}