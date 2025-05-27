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

export default function AdminRegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessDescription: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "El nombre es requerido");
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "El email es requerido");
      return false;
    }
    if (!formData.mobile.trim()) {
      Alert.alert("Error", "El teléfono es requerido");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }
    if (!formData.businessName.trim()) {
      Alert.alert("Error", "El nombre del negocio es requerido");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Primero registramos al usuario
      const registerResponse = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          accountType: 'business' // Especificamos que es una cuenta business
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Error en el registro');
      }

      // Si el registro fue exitoso, iniciamos sesión automáticamente
      const loginResponse = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'Error en el inicio de sesión');
      }

      Alert.alert(
        "Registro Exitoso",
        "Tu cuenta business ha sido creada. Ahora puedes gestionar tu bar.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/userauth/Login"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
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
        <View className="flex-1 p-5">
          {/* Header */}
          <View className="flex-row items-center mb-6 pt-10">
            <Link href="/userauth/Login" asChild>
              <TouchableOpacity className="p-2">
                <Feather name="arrow-left" size={24} color="#d97706" />
              </TouchableOpacity>
            </Link>
            <Text className="text-white text-xl font-bold ml-4">
              Registro Administrativo
            </Text>
          </View>

          {/* Info Card */}
          <View className="bg-amber-900/20 border border-amber-600/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="business" size={24} color="#fbbf24" />
              <Text className="text-amber-400 font-bold text-lg ml-2">
                Cuenta Business
              </Text>
            </View>
            <Text className="text-gray-300 text-sm">
              Crea una cuenta administrativa para gestionar bares y
              establecimientos. Tu solicitud será revisada por nuestro equipo.
            </Text>
          </View>

          {/* Form */}
          <View className="bg-gray-900 rounded-2xl p-6">
            <Text className="text-white text-xl font-bold mb-6">
              Información Personal
            </Text>

            {/* Name Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">
                Nombre Completo
              </Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="person" size={20} color="#d97706" />
                <TextInput
                  placeholder="Tu nombre completo"
                  placeholderTextColor="#6b7280"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  className="flex-1 text-white p-3 pl-2"
                />
              </View>
            </View>

            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">Email</Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="email" size={20} color="#d97706" />
                <TextInput
                  placeholder="ejemplo@gmail.com"
                  placeholderTextColor="#6b7280"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-white p-3 pl-2"
                />
              </View>
            </View>

            {/* Mobile Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">Teléfono</Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="phone" size={20} color="#d97706" />
                <TextInput
                  placeholder="+52 123 456 7890"
                  placeholderTextColor="#6b7280"
                  value={formData.mobile}
                  onChangeText={(value) => handleInputChange("mobile", value)}
                  keyboardType="phone-pad"
                  className="flex-1 text-white p-3 pl-2"
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">Contraseña</Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="lock" size={20} color="#d97706" />
                <TextInput
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
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

            {/* Confirm Password Field */}
            <View className="mb-6">
              <Text className="text-gray-400 mb-2 text-sm">
                Confirmar Contraseña
              </Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="lock" size={20} color="#d97706" />
                <TextInput
                  placeholder="Confirma tu contraseña"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleInputChange("confirmPassword", value)
                  }
                  className="flex-1 text-white p-3 pl-2"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-white text-xl font-bold mb-4">
              Información del Negocio
            </Text>

            {/* Business Name Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">
                Nombre del Negocio
              </Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="business" size={20} color="#d97706" />
                <TextInput
                  placeholder="Nombre de tu bar/establecimiento"
                  placeholderTextColor="#6b7280"
                  value={formData.businessName}
                  onChangeText={(value) =>
                    handleInputChange("businessName", value)
                  }
                  className="flex-1 text-white p-3 pl-2"
                />
              </View>
            </View>

            {/* Business Description Field */}
            <View className="mb-6">
              <Text className="text-gray-400 mb-2 text-sm">
                Descripción (Opcional)
              </Text>
              <View className="bg-gray-800 rounded-xl px-3 border border-gray-700">
                <TextInput
                  placeholder="Describe tu negocio brevemente..."
                  placeholderTextColor="#6b7280"
                  value={formData.businessDescription}
                  onChangeText={(value) =>
                    handleInputChange("businessDescription", value)
                  }
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="text-white p-3"
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className={`py-4 rounded-xl mb-4 ${
                loading ? "bg-gray-600" : "bg-amber-600"
              }`}
            >
              <Text className="text-white font-bold text-center text-lg">
                {loading ? "Enviando..." : "Solicitar Cuenta Business"}
              </Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <View className="flex-row justify-center">
              <Text className="text-gray-400">¿Ya tienes cuenta? </Text>
              <Link href="/userauth/Login" asChild>
                <TouchableOpacity>
                  <Text className="text-amber-500 font-bold">
                    Inicia Sesión
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
