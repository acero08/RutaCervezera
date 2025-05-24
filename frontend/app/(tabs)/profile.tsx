"use client";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../context/AuthContext";
import LoginScreen from "../userauth/Login";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [imageKey, setImageKey] = useState(Date.now()); // Force image refresh

  // Update image key when user changes
  useEffect(() => {
    if (user?.image) {
      setImageKey(Date.now());
    }
  }, [user?.image]);

  if (!user) {
    return <LoginScreen />;
  }

  const getProfileImageSource = () => {
    if (user?.image) {
      // Handle both relative and absolute URLs
      let imageUrl = user.image;

      if (!imageUrl.startsWith("http")) {
        imageUrl = `http://localhost:3000${imageUrl}`;
      }

      return {
        uri: `${imageUrl}?v=${imageKey}`, // Cache busting with version
      };
    }
    return require("../../assets/images/placeholder.png");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#121212" }}>
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-gray-800">
        <Text className="text-white text-2xl font-bold">Mi Perfil</Text>
      </View>

      <ScrollView className="flex-1">
        {/* User Profile Card */}
        <View className="bg-gray-900 m-4 rounded-xl overflow-hidden">
          <View className="p-4 flex-row items-center">
            <Image
              source={getProfileImageSource()}
              className="rounded-full bg-gray-800"
              style={{ width: 80, height: 80 }}
              resizeMode="cover"
              key={`profile-${user._id}-${imageKey}`} // Better key strategy
              onError={(error) => {
                console.error("Error loading profile image:", error);
              }}
              onLoad={() => {
                console.log("Profile image loaded successfully");
              }}
            />
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-bold">
                {user.name || "Usuario"}
              </Text>
              <Text className="text-amber-500">
                {user.email || "No puso su correo"}
              </Text>
              {user.mobile && (
                <Text className="text-gray-400 mt-1">{user.mobile}</Text>
              )}
              {user.gender && (
                <Text className="text-gray-400 text-sm mt-1">
                  {user.gender === "male"
                    ? "Masculino"
                    : user.gender === "female"
                    ? "Femenino"
                    : user.gender}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row border-t border-gray-800 divide-x divide-gray-800">
            <TouchableOpacity
              onPress={() => router.push(`/favorite/favorites`)}
              className="flex-1 py-3 flex-row justify-center items-center"
            >
              <MaterialIcons name="favorite" size={18} color="#d97706" />
              <Text className="text-white ml-2">Favoritos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Card */}
        <View className="bg-gray-900 mx-4 mb-4 rounded-xl p-4">
          <Text className="text-white text-lg font-bold mb-3">
            Mis Estadísticas
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-amber-900 items-center justify-center mb-1">
                <MaterialIcons name="local-bar" size={24} color="#fbbf24" />
              </View>
              <Text className="text-amber-500 font-bold">12</Text>
              <Text className="text-gray-400 text-xs">Visitas</Text>
            </View>
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-amber-900 items-center justify-center mb-1">
                <MaterialIcons name="star" size={24} color="#fbbf24" />
              </View>
              <Text className="text-amber-500 font-bold">8</Text>
              <Text className="text-gray-400 text-xs">Reseñas</Text>
            </View>
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-amber-900 items-center justify-center mb-1">
                <MaterialIcons name="emoji-events" size={24} color="#fbbf24" />
              </View>
              <Text className="text-amber-500 font-bold">3</Text>
              <Text className="text-gray-400 text-xs">Logros</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View className="bg-gray-900 mx-4 mb-4 rounded-xl overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-800"
            onPress={() => router.push("/userauth/EditProfile")}
          >
            <MaterialIcons name="edit" size={22} color="#d97706" />
            <Text className="text-white ml-3 flex-1">Editar perfil</Text>
            <Feather name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={22} color="#d97706" />
            <Text className="text-white ml-3">Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
