// Index.tsx
import React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

export default function Index() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const imageSize = isWeb ? Math.min(width * 0.4, 300) : width * 0.75;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <LinearGradient
        colors={["#121212", "#1E1E1E"]}
        style={{ flex: 1, justifyContent: "space-between" }}
      >
        {/* Header */}
        <View className="items-center pt-12 px-6">
          <Text className="text-3xl md:text-4xl text-white font-bold mb-2">
            RUTA CERVECERA
          </Text>
          <View className="h-1 w-24 bg-[#FF6600] rounded-full mb-4" />
          <Text className="text-white text-lg text-center mb-6">
            Hola borrachín, ¿Qué plan hoy?
          </Text>
        </View>

        {/* Imagen */}
        <View className="items-center justify-center">
          <Image
            source={require("../assets/images/cheve.png")}
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: 20,
            }}
            resizeMode="contain"
          />
        </View>

        {/* Texto abajo de la imagen */}
        <View className="px-8 mt-4">
          <Text
            style={{
              color: "#fff",
              fontSize: isWeb ? 16 : 14,
              textAlign: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 12,
              borderRadius: 12,
            }}
          >
            Para los cachanillas amantes de la cerveza
          </Text>
        </View>

        {/* Botón principal */}
        <View className="items-center mt-6">
          <Link href="/userauth/Login" asChild>
            <TouchableOpacity
              className="rounded-full overflow-hidden shadow-lg"
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#FF6600", "#FF8C00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 px-16"
              >
                <Text className="text-white font-bold text-xl tracking-wide text-center">
                  TRAIGO SED
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Links de sesión y registro */}
        <View className="flex-row justify-between w-full px-12 mt-6">
          <Link href="/userauth/Login" asChild>
            <TouchableOpacity className="items-center px-4 py-2 w-1/2">
              <Text className="text-white font-semibold text-base text-center">
                Iniciar Sesión
              </Text>
              <View className="h-0.5 w-full bg-[#FF6600] mt-1" />
            </TouchableOpacity>
          </Link>

          <Link href="/userauth/Register" asChild>
            <TouchableOpacity className="items-center px-4 py-2 w-1/2">
              <Text className="text-white font-semibold text-base text-center">
                Crear Cuenta
              </Text>
              <View className="h-0.5 w-full bg-[#FF6600] mt-1" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer indicador */}
        <View className="pb-6 pt-4 w-full">
          <View className="flex-row justify-center">
            <View className="h-1 w-12 bg-[#FF6600] rounded-full mx-1 opacity-30" />
            <View className="h-1 w-12 bg-[#FF6600] rounded-full mx-1 opacity-60" />
            <View className="h-1 w-12 bg-[#FF6600] rounded-full mx-1 opacity-100" />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
