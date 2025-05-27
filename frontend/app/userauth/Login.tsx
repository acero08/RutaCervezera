"use client";

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Link, useRouter } from "expo-router";
import { MaterialIcons, Feather } from "@expo/vector-icons";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña");
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      // La redirección se maneja automáticamente en el AuthContext
    } catch (error) {
      Alert.alert(
        "Error",
        "No pudimos iniciar sesión. Por favor verifica tus credenciales."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        style={{ backgroundColor: "#121212" }}
      >
        <View className="flex-1 justify-center items-center p-5">
          <Link href="/" asChild>
            <TouchableOpacity className="p-2">
              <Feather name="arrow-left" size={24} color="#d97706" />
            </TouchableOpacity>
          </Link>

          {/* Logo and Header */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-amber-900 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="local-bar" size={60} color="#fbbf24" />
            </View>
            <Text className="text-white text-3xl font-bold">
              {" "}
              Ruta Cervecera{" "}
            </Text>
            <Text className="text-amber-500 text-lg mt-1">
              ¡Descubre tu próximo brindis!
            </Text>
          </View>

          {/* Login Card */}
          <View className="w-full bg-gray-900 rounded-2xl p-6 shadow-lg">
            <Text className="text-white text-2xl font-bold mb-6">
              Inicia sesión
            </Text>

            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">
                Correo electrónico
              </Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="email" size={20} color="#d97706" />
                <TextInput
                  placeholder="ejemplo@gmail.com"
                  placeholderTextColor="#6b7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-white p-3 pl-2"
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="text-gray-400 mb-2 text-sm">Contraseña</Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="lock" size={20} color="#d97706" />
                <TextInput
                  placeholder="********"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-white p-3 pl-2"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Options Row */}
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  className={`w-5 h-5 rounded mr-2 items-center justify-center ${
                    rememberMe ? "bg-amber-600" : "border border-gray-600"
                  }`}
                >
                  {rememberMe && (
                    <Feather name="check" size={14} color="white" />
                  )}
                </View>
                <Text className="text-gray-300">Recuérdame</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`${
                isLoading ? "bg-amber-800" : "bg-amber-600"
              } py-4 rounded-xl mb-5`}
            >
              <Text className="text-white font-bold text-center text-lg">
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View className="flex-row justify-center mb-4">
              <Text className="text-gray-400">¿No tienes cuenta? </Text>
              <Link href="/userauth/Register" asChild>
                <TouchableOpacity>
                  <Text className="text-amber-500 font-bold">Regístrate</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Business Account Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-400">¿Eres dueño de un bar? </Text>
              <Link href="/userauth/AdminRegister" asChild>
                <TouchableOpacity>
                  <Text className="text-amber-500 font-bold">Cuenta Business</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
