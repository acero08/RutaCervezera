// frontend/app/userauth/Login.tsx
import React from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Link } from "expo-router";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <View className="flex-1 justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="border p-2 mb-2"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border p-2 mb-4"
      />
      <Button title="Login" onPress={() => login(email, password)} />
      <Link href="/userauth/Register" className="text-blue-500 mt-4">
        Create Account
      </Link>
    </View>
  );
}
