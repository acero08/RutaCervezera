import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { AxiosError } from "axios";

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
    <View className="flex-1 p-4 bg-gray-100">
      <TextInput
        className="mb-4 p-2 bg-white rounded border border-gray-300"
        placeholder="Nombre completo"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <TextInput
        className="mb-4 p-2 bg-white rounded border border-gray-300"
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />

      <TextInput
        className="mb-4 p-2 bg-white rounded border border-gray-300"
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={formData.mobile}
        onChangeText={(text) => setFormData({ ...formData, mobile: text })}
      />

      <TextInput
        className="mb-6 p-2 bg-white rounded border border-gray-300"
        placeholder="Contraseña"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
      />

      <Button title="Registrarse" onPress={handleSubmit} color="#3b82f6" />
    </View>
  );
};

export default RegisterPage;
