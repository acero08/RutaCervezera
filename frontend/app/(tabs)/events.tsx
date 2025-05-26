"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from "react-native"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
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
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const data =
          selectedFilter === "all"
            ? await Promise.all(
                (["today", "week", "month"] as Array<"today" | "week" | "month">).map((r) => eventService.getEvents(r))
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

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-14 pb-6">
        <Text className="text-white text-3xl font-bold mb-1">Explora Eventos</Text>
        <Text className="text-amber-500 text-lg font-medium">La excusa perfecta para ir a tomar</Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className="flex-row items-center bg-gray-800 rounded-2xl px-4 py-3 shadow-lg">
          <Feather name="search" size={20} color="#d97706" />
          <TextInput
            placeholder="Busca eventos increíbles..."
            placeholderTextColor="#9ca3af"
            className="flex-1 text-white ml-3 py-1 text-base"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Options */}
      <View className="px-6 mb-6">
        <View className="flex-row gap-3 overflow-x-auto pb-2">
          {FILTER_OPTIONS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              className={`px-6 py-3 rounded-full shadow-md ${
                selectedFilter === filter.value
                  ? "bg-amber-500 shadow-amber-500/30"
                  : "bg-gray-800/50 border border-gray-700/50"
              }`}
              onPress={() => setSelectedFilter(filter.value)}
            >
              <Text
                className={`whitespace-nowrap font-semibold ${
                  selectedFilter === filter.value ? "text-black" : "text-gray-300"
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#d97706" />
          <Text className="text-white mt-4 text-lg">Cargando eventos...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Events List */}
          <View className="pb-8">
            <Text className="text-white text-xl font-bold mb-6">Eventos Disponibles</Text>

            {filteredEvents.map((event) => (
              <TouchableOpacity
                key={event._id}
                onPress={() => router.push({
                  pathname: "/events/[eventId]",
                  params: { eventId: event._id },
                })} 
                className="bg-gray-900 rounded-2xl overflow-hidden mb-6 shadow-xl border border-gray-800"
              >
                {/* Event Image */}
                <View className="relative">
                  <Image
                    source={{ uri: event.image || "https://via.placeholder.com/400x200" }}
                    className="w-full h-48 bg-gray-800"
                  />

                  {/* Date Badge */}
                  <View className="absolute top-4 right-4 bg-amber-600 px-4 py-2 rounded-xl shadow-lg">
                    <Text className="text-black font-bold text-sm">
                      {new Date(event.date).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                </View>

                {/* Event Details */}
                <View className="p-6">
                  <Text className="text-white text-xl font-bold mb-4">{event.title}</Text>

                  <View className="space-y-3 mb-5">
                    <View className="flex-row items-center">
                      <MaterialIcons name="location-on" size={18} color="#d97706" />
                      <Text className="text-gray-400 ml-2 text-base">
                        {event.location || "Ubicación no especificada"}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <MaterialIcons name="access-time" size={18} color="#d97706" />
                      <Text className="text-gray-400 ml-2 text-base">
                        {new Date(event.date).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-amber-500 rounded-full mr-2"></View>
                      <Text className="text-amber-500 font-bold text-base">{event.bar?.name || "Bar desconocido"}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {filteredEvents.length === 0 && (
              <View className="items-center py-16">
                <Text className="text-6xl mb-4">🍺</Text>
                <Text className="text-white text-xl font-bold mb-2">No hay eventos</Text>
                <Text className="text-gray-400 text-center px-8">
                  Intenta cambiar los filtros o buscar algo diferente
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
