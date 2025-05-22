"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from "react-native"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import EventService from "../../services/EventService"

const FILTER_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "Hoy", value: "today" },
  { label: "Esta semana", value: "week" },
  { label: "Este mes", value: "month" },
]

export default function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("week")
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const eventService = EventService.getInstance()

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const data = selectedFilter === "all"
          ? await Promise.all(
              (["today", "week", "month"] as Array<"today" | "week" | "month">).map((r) =>
                eventService.getEvents(r)
              )
            )
          : [await eventService.getEvents(selectedFilter as "today" | "week" | "month")]

        const merged = selectedFilter === "all" ? data.flat() : data[0]
        setEvents(merged)
      } catch (error) {
        console.error("Error cargando eventos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [selectedFilter])

  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [featuredEvent, ...regularEvents] = filteredEvents

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">Explora Eventos</Text>
        <Text className="text-amber-500 text-lg">¿Listo para brindar?</Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-2">
          <Feather name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Busca eventos..."
            placeholderTextColor="#9ca3af"
            className="flex-1 text-white ml-2 py-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 pl-4">
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedFilter === filter.value ? "bg-amber-600" : "bg-gray-800 border border-gray-700"
            }`}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text className={`${selectedFilter === filter.value ? "text-white" : "text-gray-300"} font-medium`}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFA500" />
          <Text className="text-white mt-2">Cargando eventos...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Featured Event */}
          {featuredEvent && (
            <View className="px-4 mb-6">
              <Text className="text-white text-lg font-bold mb-3">Evento Destacado</Text>
              <TouchableOpacity className="bg-gray-900 rounded-xl overflow-hidden">
                <Image source={{ uri: featuredEvent.image || "https://via.placeholder.com/400x200" }} className="w-full h-40 bg-gray-800" />
                <View className="absolute top-0 right-0 bg-amber-600 px-3 py-1 rounded-bl-xl">
                  <Text className="text-white font-bold">
                    {new Date(featuredEvent.date).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short"
                    })}
                  </Text>
                </View>
                <View className="p-4">
                  <Text className="text-white text-xl font-bold mb-1">{featuredEvent.title}</Text>
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="location-on" size={16} color="#d97706" />
                    <Text className="text-gray-400 ml-1">{featuredEvent.location || "Ubicación no especificada"}</Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <MaterialIcons name="access-time" size={16} color="#d97706" />
                    <Text className="text-gray-400 ml-1">
                      {new Date(featuredEvent.date).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="local-bar" size={16} color="#d97706" />
                    <Text className="text-amber-500 ml-1 font-medium">{featuredEvent.bar?.name || "Bar desconocido"}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* List of Events */}
          <View className="px-4 mb-6">
            <Text className="text-white text-lg font-bold mb-3">Próximos Eventos</Text>
            {regularEvents.map((event) => (
              <TouchableOpacity key={event._id} className="bg-gray-900 rounded-xl overflow-hidden mb-3 flex-row">
                <Image source={{ uri: event.image || "https://via.placeholder.com/100" }} className="w-24 h-24 bg-gray-800" />
                <View className="flex-1 p-3 justify-between">
                  <View>
                    <Text className="text-white font-bold">{event.title}</Text>
                    <View className="flex-row items-center mt-1">
                      <MaterialIcons name="location-on" size={14} color="#d97706" />
                      <Text className="text-gray-400 text-xs ml-1">{event.location || "Ubicación no disponible"}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <MaterialIcons name="event" size={14} color="#d97706" />
                      <Text className="text-amber-500 text-xs ml-1 font-medium">
                        {new Date(event.date).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short"
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
