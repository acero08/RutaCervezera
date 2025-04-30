import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import Octicons from "@expo/vector-icons/Octicons";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Layout = () => {
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Octicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Octicons name="person" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="collection"
        options={{
          title: "Saved",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmarks" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;
