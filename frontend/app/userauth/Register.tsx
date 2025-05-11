import React, { useState } from "react";
import { View, TextInput, Text, Alert, TouchableOpacity, Button } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { AxiosError } from "axios";
import { FontAwesome } from "@expo/vector-icons";

const RegisterPage = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    gender: "",
  });

  const handleSubmit = async () => {
    try {
      await register(formData);
      Alert.alert("¡Registro exitoso!", "Cuenta creada correctamente");
    } catch (error) {
      let errorMessage = "Error desconocido";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosError;
        errorMessage =
          (axiosError.response?.data as any)?.message || errorMessage;
      }

      Alert.alert("Error en registro", errorMessage);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#1E1E1E] p-4">
      <View className="w-80 bg-[#2A2A2A] rounded-3xl p-6">
        {/* Encabezado */}
        <View className="relative mb-6">
          <Text className="text-2xl font-bold text-white text-center mt-12"> Crea una cuenta </Text>
          <Text className="text-center text-white font-bold mb-4"> ¡Crea una cuenta para conocer más cervezas! </Text>
        </View>

        {/* Campos de texto */}
        <Text className="text-white font-bold mb-2"> Nombre </Text>
        <TextInput
          placeholder="Nombre completo"
          placeholderTextColor="#B0B0B0"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          className="bg-[#3A3A3A] text-white p-3 mb-4 rounded-md"
        />

        <Text className="text-white font-bold  mb-2"> Correo </Text>
        <TextInput
          placeholder="ejemplo@gmail.com"
          placeholderTextColor="#B0B0B0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          className="bg-[#3A3A3A] text-white p-3 mb-4 rounded-md"
        />

        <Text className="text-white font-bold mb-2"> Contraseña </Text>
        <View className="flex-row items-center bg-[#3A3A3A] rounded-md mb-4">
          <TextInput
            placeholder="********"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            className="flex-1 text-white p-3"
          />
          <FontAwesome name="eye-slash" size={20} color="#B0B0B0" className="mr-3" />
        </View>

        {/* Botón para registrar */}
        <TouchableOpacity 
          onPress={handleSubmit} 
          className="bg-[#FF6600] py-3 rounded-full"
        >
          <Text className="text-white font-bold text-center"> Crear cuenta </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterPage;
