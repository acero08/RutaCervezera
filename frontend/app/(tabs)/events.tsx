"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from "react-native"
import { MaterialIcons, Feather } from "@expo/vector-icons"

// Sample data for events
const EVENTS_DATA = [
  {
    id: "1",
    title: "Festival de Cerveza Artesanal",
    location: "Plaza Mayor, Madrid",
    date: "15 Jun",
    time: "16:00 - 23:00",
    image: "/placeholder.svg?height=120&width=120",
    bar: "Puzzles Bar",
    attending: 128,
    interested: 256,
  },
  {
    id: "2",
    title: "Cata de Cervezas Belgas",
    location: "Calle Falsa 123, Barcelona",
    date: "22 Jun",
    time: "19:00 - 21:30",
    image: "/placeholder.svg?height=120&width=120",
    bar: "Bar Ejemplo",
    attending: 45,
    interested: 89,
  },
  {
    id: "3",
    title: "Noche de Trivia Cervecera",
    location: "Calz Celys, Valencia",
    date: "18 Jun",
    time: "20:00 - 23:00",
    image: "/placeholder.svg?height=120&width=120",
    bar: "Puzzles Bar",
    attending: 32,
    interested: 67,
  },
  {
    id: "4",
    title: "Maridaje: Cerveza y Tapas",
    location: "Calle Falsa 123, Barcelona",
    date: "25 Jun",
    time: "18:30 - 22:00",
    image: "/placeholder.svg?height=120&width=120",
    bar: "Bar Ejemplo",
    attending: 56,
    interested: 112,
  },
  {
    id: "5",
    title: "Lanzamiento: Nueva IPA Local",
    location: "Calz Celys, Valencia",
    date: "30 Jun",
    time: "17:00 - 23:59",
    image: "/placeholder.svg?height=120&width=120",
    bar: "Puzzles Bar",
    attending: 87,
    interested: 143,
  },
]

// Filter options for events
const FILTER_OPTIONS = ["Todos", "Hoy", "Esta semana", "Este mes", "Gratis"]

export default function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("Todos")
  const [featuredEvent, ...regularEvents] = EVENTS_DATA

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold"> no le hagas caso a esto es nomas para q no este vacio </Text>
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
            key={filter}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedFilter === filter ? "bg-amber-600" : "bg-gray-800 border border-gray-700"
            }`}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text className={`${selectedFilter === filter ? "text-white" : "text-gray-300"} font-medium`}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1">
        {/* Featured Event */}
        <View className="px-4 mb-6">
          <Text className="text-white text-lg font-bold mb-3">Evento Destacado</Text>
          <TouchableOpacity className="bg-gray-900 rounded-xl overflow-hidden">
            <Image source={{ uri: featuredEvent.image }} className="w-full h-40 bg-gray-800" />
            <View className="absolute top-0 right-0 bg-amber-600 px-3 py-1 rounded-bl-xl">
              <Text className="text-white font-bold">{featuredEvent.date}</Text>
            </View>
            <View className="p-4">
              <Text className="text-white text-xl font-bold mb-1">{featuredEvent.title}</Text>
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="location-on" size={16} color="#d97706" />
                <Text className="text-gray-400 ml-1">{featuredEvent.location}</Text>
              </View>
              <View className="flex-row items-center mb-3">
                <MaterialIcons name="access-time" size={16} color="#d97706" />
                <Text className="text-gray-400 ml-1">{featuredEvent.time}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <MaterialIcons name="local-bar" size={16} color="#d97706" />
                  <Text className="text-amber-500 ml-1 font-medium">{featuredEvent.bar}</Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity className="bg-gray-800 px-3 py-1 rounded-full mr-2">
                    <Text className="text-white">Interesado</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-amber-600 px-3 py-1 rounded-full">
                    <Text className="text-white">Asistiré</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming Events */}
        <View className="px-4 mb-6">
          <Text className="text-white text-lg font-bold mb-3">Próximos Eventos</Text>
          {regularEvents.map((event) => (
            <TouchableOpacity key={event.id} className="bg-gray-900 rounded-xl overflow-hidden mb-3 flex-row">
              <Image source={{ uri: event.image }} className="w-24 h-24 bg-gray-800" />
              <View className="flex-1 p-3 justify-between">
                <View>
                  <Text className="text-white font-bold">{event.title}</Text>
                  <View className="flex-row items-center mt-1">
                    <MaterialIcons name="location-on" size={14} color="#d97706" />
                    <Text className="text-gray-400 text-xs ml-1">{event.location}</Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <MaterialIcons name="event" size={14} color="#d97706" />
                    <Text className="text-amber-500 text-xs ml-1 font-medium">
                      {event.date} • {event.time.split(" - ")[0]}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="people" size={14} color="#d97706" />
                    <Text className="text-gray-400 text-xs ml-1">{event.attending}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Bars with Events */}
        <View className="px-4 mb-20">
          <Text className="text-white text-lg font-bold mb-3">Bares con Eventos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[...new Set(EVENTS_DATA.map((event) => event.bar))].map((bar, index) => (
              <TouchableOpacity key={index} className="bg-gray-900 rounded-xl mr-3 w-40 overflow-hidden">
                <View className="h-24 bg-gray-800 items-center justify-center">
                  <MaterialIcons name="local-bar" size={40} color="#d97706" />
                </View>
                <View className="p-3">
                  <Text className="text-white font-bold">{bar}</Text>
                  <Text className="text-gray-400 text-xs">
                    {EVENTS_DATA.filter((event) => event.bar === bar).length} eventos
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}
