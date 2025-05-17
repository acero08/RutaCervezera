"use client"

import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import { useLocalSearchParams } from "expo-router"
import BarService from "../../services/BarService"
import { Ionicons } from "@expo/vector-icons"

const BarDetails = () => {
  const api = BarService.getInstance()
  const { id } = useLocalSearchParams()
  const [bar, setBar] = useState<any>(null)
  const [menu, setMenu] = useState<any[]>([])
  const [alcoholicMenu, setAlcoholicMenu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false) // esto es nomas para tener el boton, luego hay que implementar la logica de favoritos

  useEffect(() => {
    const fetchBarDetails = async () => {
      try {
        const [barData, menuData, alcoholData] = await Promise.all([
          api.barDetails(id as string),
          api.barMenu(id as string),
          api.alcoholicDrinks(id as string)
        ])

        setBar(barData)
        const food = menuData.data?.food || []
        const drink = menuData.data?.drink || []
        const alcohol = alcoholData.data || []

        setMenu([...food, ...drink])
        setAlcoholicMenu(alcohol)
      } catch (error) {
        console.error("Error al cargar detalles del bar:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBarDetails()
  }, [id])

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // Aquí implementarías la lógica para guardar favoritos en tu API
  }

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    )

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}></View>

      {/* Imagen y botones */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="beer" size={80} color="#FFA500" />
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => history.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#FFA500" : "white"} />
        </TouchableOpacity>
      </View>

      {/* Calificación */}
      <View style={styles.ratingContainer}>
        <View style={styles.ratingItem}>
          <Ionicons name="star" size={18} color="#FFA500" />
          <Text style={styles.ratingText}>{bar.rating}</Text>
        </View>
      </View>

      {/* Nombre */}
      <Text style={styles.barName}>{bar.name}</Text>

      {/* Descripción */}
      <Text style={styles.description}>
        {bar.description || `${bar.name} son unos aburridos y no quisieron poner una descripción. ¿Su bebida será igual de aburrida?`}
      </Text>

      {/* aqui iria lo del alcohol */}

      {/* Menú de comidas y bebidas */}
      {menu.length > 0 && (
        <>
          <Text style={styles.menuTitle}>Menú ({menu.length})</Text>
          <View style={styles.menuGrid}>
            {menu.map((item, index) => (
              <View key={index} style={styles.menuItem}>
                <View style={styles.menuImagePlaceholder}>
                  <Ionicons name="restaurant" size={40} color="#FFA500" />
                </View>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemDescription}>{item.description || "Producto del bar"}</Text>
                <Text style={styles.menuItemPrice}>${item.price}</Text>
              </View>
            ))}
          </View>
        </>
      )}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  ratingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  ratingText: {
    color: "white",
    marginLeft: 4,
    fontWeight: "bold",
  },
  barName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  description: {
    fontSize: 14,
    color: "#CCC",
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  menuItem: {
    width: "50%",
    padding: 8,
  },
  menuImagePlaceholder: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFA500",
  },
})

export default BarDetails
