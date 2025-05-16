"use client"

import { useEffect, useState } from "react"
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet, TouchableOpacity, TextInput } from "react-native"
import BarService from "../../services/BarService"
import { Link } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

const BarsScreen = () => {
  const [bars, setBars] = useState<any[]>([]) // jala la info de bares
  const [filteredBars, setFilteredBars] = useState<any[]>([]) //es para la barra de busqueda
  const [searchQuery, setSearchQuery] = useState("") // muestra por default la barra vacia, osea salen todos los bares
  const [loading, setLoading] = useState(true) // el loading ps tu lo hiciste 
  const api = BarService.getInstance() // conexion con la api

  // Carga los bares
  useEffect(() => {
    const fetchBars = async () => {
      try {
        const data = await api.getAllBars()
        const enhancedData = data.map((bar: any) => ({
          ...bar,
        }))
        setBars(enhancedData)
        setFilteredBars(enhancedData)
      } catch (error) {
        console.error("Error al obtener los bares:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBars()
  }, [])

  // Instrucciones de la barra de busqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setFilteredBars(bars)
    } else {
      const filtered = bars.filter((bar) => bar.name.toLowerCase().includes(query.toLowerCase()))
      setFilteredBars(filtered)
    }
  }

  // loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    )
  }

  // Ya aqui esta toda la onda de el view
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cervecerias</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="beer" size={24} color="orange" />
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <Text style={styles.greeting}> Hola borrachín, ¿Qué plan hoy? </Text>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busca cerveceria..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Lista de bares */}
      <FlatList
        data={filteredBars}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Link href={`/bars/${item._id}`} asChild>
            <TouchableOpacity style={styles.card}>
              {/* Image */}
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="beer" size={40} color="#FFA500" />
                </View>
              )}

              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description || `Ubicado en ${item.address}. ¿Tú próximo blackout? Picame y descubre más...`}
                </Text>

                <View style={styles.footer}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFA500" />
                    <Text style={styles.rating}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#CCCCCC",
  },
  iconButton: {
    padding: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#333",
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  rating: {
    marginLeft: 4,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    marginLeft: 4,
    color: "#FFFFFF",
  },
})

export default BarsScreen
