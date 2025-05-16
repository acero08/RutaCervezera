"use client"
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native"
import { useAuth } from "../../context/AuthContext"
import LoginScreen from "../userauth/Login"
import UserInfo from "../userauth/UserInfo"
import { Feather, MaterialIcons } from "@expo/vector-icons"

export default function Profile() {
  const { user } = useAuth()

  if (!user) {
    return <LoginScreen />
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#121212" }}>
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-gray-800">
        <Text className="text-white text-2xl font-bold"> Mi perfi </Text>
      </View>

      <ScrollView className="flex-1">
        {/* User Profile Card */}
        <View className="bg-gray-900 m-4 rounded-xl overflow-hidden">
          <View className="p-4 flex-row items-center">
            <Image
              source={{ uri: "/placeholder.svg?height=80&width=80" }}
              className="w-20 h-20 rounded-full bg-gray-800"
            />
            <View className="ml-4">
              <Text className="text-white text-xl font-bold">{user.name || "Usuario"}</Text>
              <Text className="text-amber-500">{user.email || "mr no puso su correo"}</Text>
            </View>
          </View>

          <View className="flex-row border-t border-gray-800 divide-x divide-gray-800">
            <TouchableOpacity className="flex-1 py-3 flex-row justify-center items-center">
              <MaterialIcons name="favorite" size={18} color="#d97706" />
              <Text className="text-white ml-2">Favoritos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Card */}
        <View className="bg-gray-900 mx-4 mb-4 rounded-xl p-4">
          <Text className="text-white text-lg font-bold mb-3">Mis Estadísticas</Text>
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
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-800">
            <MaterialIcons name="settings" size={22} color="#d97706" />
            <Text className="text-white ml-3 flex-1"> No se que poner aqui pero puede ser util </Text>
            <Feather name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <MaterialIcons name="logout" size={22} color="#d97706" />
            <Text className="text-white ml-3">Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
