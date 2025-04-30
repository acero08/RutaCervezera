// profile.tsx
import React from "react";
import { View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import LoginScreen from "../userauth/Login";
import UserInfo from "../userauth/UserInfo";

export default function Profile() {
  const { user } = useAuth();

  return (
    <View className="flex-1 bg-white">
      {!user ? <LoginScreen /> : <UserInfo />}
    </View>
  );
}
