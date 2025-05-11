import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-[#1E1E1E]"> {/* Cambié el color de fondo a #1E1E1E */}
        <Text className="text-3xl text-white font-bold mb-6">RUTA CERVECERA</Text>

        <Image
          source={require("../assets/images/perrito.png")}
          style={{ width: 280, height: 340, marginBottom: 24 }}
        /> {/* Agregue la foto del perrito */}

        <Text className="text-white mb-6 text-center font-bold text-xl">
          Para los cachanillas amantes de la cerveza
        </Text>

        <TouchableOpacity className="bg-[#FF6600] rounded-full py-3 px-12 mb-6">
          <Text className="text-white font-bold text-xl">TRAIGO SED</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between w-full px-10 mb-6">
          <Text className="text-white font-bold text-lg"><a href="userauth/Login"> Iniciar Sesión </a></Text> {/* Te lleva a la pantalla de iniciar sesion */}
          <Text className="text-white font-bold text-lg"><a href="userauth/Register"> Crear Cuenta </a></Text> {/* Te lleva a la pantalla de registro */}
        </View>
    </View>
  );
}
