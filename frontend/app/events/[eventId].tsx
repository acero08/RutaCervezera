"use client"

import { View, Text, Image, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import EventService from "../../services/EventService"
import { MaterialIcons } from "@expo/vector-icons"

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [barName, setBarName] = useState("Bar desconocido")
  const router = useRouter()
  const api = EventService.getInstance()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const events = await api.getEvents("month") 
        const found = events.find((e) => e._id === eventId)
        
        console.log("Evento encontrado:", found) // Para depuración
        
        if (found) {
          setEvent(found)
          
          if (typeof found.bar === 'string' && found.bar.length > 0) {
            try {
              const barDetails = await api.getBarById(found.bar)
              setBarName(barDetails.name)
            } catch (error) {
              console.error("Error al obtener detalles del bar:", error)
              setBarName("Error al cargar el bar")
            }
          } 
        }
      } catch (error) {
        console.error("Error al cargar el evento:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#d97706" />
        <Text className="text-white mt-4">Cargando evento...</Text>
      </View>
    )
  }

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg font-bold">Evento no encontrado</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-black">
      {/* Imagen principal */}
      <View className="relative">
        <Image
          source={{ uri: event.image || "https://via.placeholder.com/400x200" }}
          className="w-full h-64 bg-gray-800"
        />
        <TouchableOpacity
          className="absolute top-12 left-4 bg-black/50 p-2 rounded-full"
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="absolute top-4 right-4 bg-amber-600 px-4 py-2 rounded-xl shadow-lg">
          <Text className="text-black font-bold text-sm">
            {new Date(event.date).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
            })}
          </Text>
        </View>
      </View>

      {/* Detalles */}
      <View className="p-6">
        <Text className="text-white text-2xl font-bold mb-3">{event.title}</Text>

        <View className="space-y-4 mb-6">
          <View className="flex-row items-center">
            <MaterialIcons name="location-on" size={20} color="#d97706" />
            <Text className="text-gray-400 ml-2 text-base">{event.location || "Ubicación no disponible"}</Text>
          </View>

          <View className="flex-row items-center">
            <MaterialIcons name="access-time" size={20} color="#d97706" />
            <Text className="text-gray-400 ml-2 text-base">
              {new Date(event.date).toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View className="flex-row items-center">
            <MaterialIcons name="local-bar" size={20} color="#d97706" />
            <Text className="text-amber-500 ml-2 font-semibold text-base">
              {barName}
            </Text>
          </View>
        </View>

        <Text className="text-white text-base leading-relaxed">
          {event.description || "Este evento no tiene descripción."}
        </Text>
      </View>
    </ScrollView>
  )
}