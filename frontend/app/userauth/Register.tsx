"use client"

import { useState } from "react"
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useAuth } from "../../context/AuthContext"
import type { AxiosError } from "axios"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import { Link } from "expo-router"

const RegisterPage = () => {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const handleSubmit = async () => {
    if (!agreeToTerms) {
      Alert.alert("Términos y condiciones", "Debes aceptar los términos y condiciones para continuar.")
      return
    }

    try {
      await register(formData)
      Alert.alert("¡Registro exitoso!", "Cuenta creada correctamente")
    } catch (error) {
      let errorMessage = "Error desconocido"

      if (error instanceof Error) {
        errorMessage = error.message
      }

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosError
        errorMessage = (axiosError.response?.data as any)?.message || errorMessage
      }

      Alert.alert("Error en registro", errorMessage)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: "#121212" }} className="flex-1">
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
            <Text className="text-white text-2xl font-bold mb-2">¡Únete a nosotros!</Text>
            <Text className="text-gray-400 mb-6">Crea una cuenta para descubrir las mejores cervezas</Text>

            {/* Name Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">Nombre completo</Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="person" size={20} color="#d97706" />
                <TextInput
                  placeholder="Tu nombre"
                  placeholderTextColor="#6b7280"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  className="flex-1 text-white p-3 pl-2"
                />
              </View>
            </View>

            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">Correo electrónico</Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="email" size={20} color="#d97706" />
                <TextInput
                  placeholder="ejemplo@gmail.com"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  className="flex-1 text-white p-3 pl-2"
                />
              </View>
            </View>

            {/* Mobile Field */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2 text-sm">Número de teléfono</Text>
              <View className="flex-row items-center bg-gray-800 rounded-xl px-3 border border-gray-700">
                <MaterialIcons name="phone" size={20} color="#d97706" />
                <TextInput
                  placeholder="+34 600 000 000"
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                  value={formData.mobile}
                  onChangeText={(text) => setFormData({ ...formData, mobile: text })}
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
                  placeholder="********"
                  placeholderTextColor="#6b7280"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  className="flex-1 text-white p-3 pl-2"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity onPress={handleSubmit} className="bg-amber-600 py-4 rounded-xl mb-6">
              <Text className="text-white font-bold text-center text-lg">Crear cuenta</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default RegisterPage
