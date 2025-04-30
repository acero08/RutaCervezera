import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function UserInfo() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <View className="flex-1 items-center p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">{user.name}</Text>
      <Text className="text-gray-600 mb-2">Email: {user.email}</Text>
      <Text className="text-gray-600 mb-6">Phone number: {user.mobile}</Text>
      <TouchableOpacity
        onPress={() => logout()}
        className="bg-red-500 rounded px-4 py-2"
      >
        <Text style={{ color: "white" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
