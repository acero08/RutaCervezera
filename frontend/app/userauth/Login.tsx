// frontend/app/userauth/Login.tsx
import React from "react";
import { View, Text, TextInput, Button, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Link } from "expo-router";


export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <View className="flex-1 justify-center items-center bg-[#1E1E1E] p-4">
      <View className="w-80 bg-[#2A2A2A] rounded-3xl p-6">
        <View className="relative mb-4">
          <Text className="text-2xl font-bold text-black text-center font-bold color-white mt-12">Inicia sesión</Text>
          <Text className="text-center text-black font-bold color-white mb-4">¡Inicia sesión para poder ir a tomar!</Text>
        </View>

        {/* Campos de texto */}
        <Text className="text-white font-bold mb-2"> Correo </Text>
        <TextInput
          placeholder="ejemplo@gmail.com"
          placeholderTextColor="#B0B0B0"
          value={email}
          onChangeText={setEmail}
          className="bg-[#3A3A3A] text-white p-3 mb-4 rounded-md"
        />
        <Text className="text-white font-bold mb-2"> Contraseña </Text>
        <TextInput
          placeholder="********"
          placeholderTextColor="#B0B0B0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="bg-[#3A3A3A] text-white p-3 mb-4 rounded-md"
        />

        {/* Opciones de recordar y botón de inicio */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity>
            <Text className="text-white"> Recuerdame </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => login(email, password)} 
          className="bg-[#FF6600] py-3 rounded-full mb-4"
        >
          <Text className="text-white font-bold text-center"> Iniciar Sesión</Text>
        </TouchableOpacity>

        {/* Texto de registro */}
        <Text className="text-center text-white">
          ¿No tienes cuenta?{" "}
          <Link href="/userauth/Register" className="text-[#FF6600] font-bold">
            Registrate
          </Link>
        </Text>
      </View>
    </View>
  );
}
