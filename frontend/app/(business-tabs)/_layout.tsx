import React from "react";
import { Tabs, Redirect } from "expo-router";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function BusinessLayout() {
  const { user, loading } = useAuth();

  console.log('BusinessLayout - Current user:', user?.accountType);

  // Si está cargando, muestra un indicador de carga
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#E4AB1C" />
      </View>
    );
  }

  // Si no hay usuario o no es una cuenta business, redirige a la página principal
  if (!user || user.accountType !== 'business') {
    console.log('Unauthorized access to business layout, redirecting...');
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
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
        name="hosting"
        options={{
          title: "Hosting",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="preview"
        options={{
          title: "Vista Previa",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="eye" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reportes",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="graph" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: "Business",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={24} color={color}/>
          ),
        }}
      />
    </Tabs>
  );
}