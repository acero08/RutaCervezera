"use client";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../context/AuthContext";
import LoginScreen from "../userauth/Login";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [imageKey, setImageKey] = useState(Date.now()); // Force image refresh

  // Update image key when user changes or when component focuses
  useEffect(() => {
    if (user?.image) {
      setImageKey(Date.now());
    }
  }, [user?.image]);

  // Listen for focus events to refresh user data
  useEffect(() => {
    const unsubscribe = router.canGoBack?.() // Check if navigation is available
      ? undefined
      : (() => {
          // For web or when navigation focus events aren't available
          const handleFocus = () => {
            refreshUser();
            setImageKey(Date.now());
          };

          window.addEventListener("focus", handleFocus);
          return () => window.removeEventListener("focus", handleFocus);
        })();

    return unsubscribe;
  }, [refreshUser, router]);

  if (!user) {
    return <LoginScreen />;
  }

  const getProfileImageSource = () => {
    if (user?.image) {
      // Handle both relative and absolute URLs
      let imageUrl = user.image;

      if (!imageUrl.startsWith("http")) {
        // Remove leading slash if present to avoid double slash
        if (imageUrl.startsWith("/")) {
          imageUrl = imageUrl.substring(1);
        }
        imageUrl = `http://localhost:3000/${imageUrl}`;
      }

      // Add cache busting parameter
      return {
        uri: `${imageUrl}?v=${imageKey}`,
      };
    }
    return require("../../assets/images/placeholder.png");
  };

  const handleLogout = () => {
    logout();
  };

  const handleEditProfile = () => {
    router.push("/userauth/EditProfile");
  };

  const handleRefreshProfile = async () => {
    try {
      await refreshUser();
      setImageKey(Date.now()); // Force image refresh
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#121212" }}>
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-gray-800 flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">Mi Perfil</Text>
        <TouchableOpacity onPress={handleRefreshProfile} className="p-2">
          <MaterialIcons name="refresh" size={24} color="#d97706" />
        </TouchableOpacity>
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
              key={`profile-img-${user._id}-${Date.now()}`} // Clave única para forzar recarga
              onError={(error) => {
                console.error("Error loading profile image:", error);
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

        {/* Menu Options */}
        <View className="bg-gray-900 mx-4 mb-4 rounded-xl overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-800"
            onPress={handleEditProfile}
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
