"use client";

import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import type { AxiosError } from "axios";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";

const RegisterPage = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!agreeToTerms) {
      Alert.alert(
        "Términos y condiciones",
        "Debes aceptar los términos y condiciones para continuar.",
        [{ text: "Entendido" }]
      );
      return;
    }

    // Validación de campos vacíos
    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.password
    ) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos", [
        { text: "Entendido" },
      ]);
      return;
    }

    // Validación básica de email
    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      Alert.alert("Email inválido", "Por favor ingresa un email válido", [
        { text: "Entendido" },
      ]);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      Alert.alert("¡Registro exitoso!", "Cuenta creada correctamente", [
        { text: "OK", onPress: () => router.replace("/(tabs)/profile") },
      ]);
    } catch (error) {
      let errorMessage = "Ocurrió un error durante el registro";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosError;
        errorMessage =
          (axiosError.response?.data as any)?.message || errorMessage;
      }

      Alert.alert("Error en registro", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: "#121212" }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center p-5">
          {/* Header */}
          <View className="w-full flex-row items-center mb-6">
            <Link href="/userauth/Login" asChild>
              <TouchableOpacity className="p-2">
                <Feather name="arrow-left" size={24} color="#d97706" />
              </TouchableOpacity>
            </Link>
            <View className="flex-1 items-center">
              <Text className="text-white text-xl font-bold">Crear cuenta</Text>
            </View>
            <View style={{ width: 32 }} />
          </View>

          {/* Registration Card */}
          <View className="w-full bg-gray-900 rounded-2xl p-6 shadow-lg">
            <Text className="text-white text-2xl font-bold mb-2">
              ¡Únete a nosotros!
            </Text>
            <Text className="text-gray-400 mb-6">
              Crea una cuenta para descubrir las mejores cervezas
            </Text>

            {/* Name Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">
                Nombre completo
              </Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="person" size={20} color="#d97706" />
                <TextInput
                  placeholder="Tu nombre"
                  placeholderTextColor="#6b7280"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  className="flex-1 text-white p-3 pl-2"
                  autoCorrect={false}
                />
              </View>
            </View>

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
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      email: text.toLowerCase().trim(),
                    })
                  }
                  className="flex-1 text-white p-3 pl-2"
                />
              </View>
            </View>

            {/* Mobile Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">
                Número de teléfono
              </Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="phone" size={20} color="#d97706" />
                <TextInput
                  placeholder="+34 600 000 000"
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                  value={formData.mobile}
                  onChangeText={(text) =>
                    setFormData({ ...formData, mobile: text.trim() })
                  }
                  className="flex-1 text-white p-3 pl-2"
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">
                Contraseña (mínimo 6 caracteres)
              </Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="lock" size={20} color="#d97706" />
                <TextInput
                  placeholder="********"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
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

            {/* Términos y condiciones */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                className="mr-2"
              >
                <MaterialIcons
                  name={agreeToTerms ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color={agreeToTerms ? "#d97706" : "#6b7280"}
                />
              </TouchableOpacity>
              <Text className="text-gray-400 text-sm">
                Acepto los{" "}
                <Text className="text-amber-600">términos y condiciones</Text> y
                la{" "}
                <Text className="text-amber-600">política de privacidad</Text>
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-amber-600 py-4 rounded-xl mb-6"
              disabled={isSubmitting}
            >
              <Text className="text-white font-bold text-center text-lg">
                {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-400">¿Ya tienes una cuenta? </Text>
              <Link href="/userauth/Login" asChild>
                <TouchableOpacity>
                  <Text className="text-amber-600 font-bold">
                    Inicia sesión
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterPage;
