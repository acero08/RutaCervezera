"use client";

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import BarService from "../../services/BarService";
import { Ionicons } from "@expo/vector-icons";

const BarDetails = () => {
  const api = BarService.getInstance();
  const { id } = useLocalSearchParams();
  const [bar, setBar] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [drinkItems, setDrinkItems] = useState<any[]>([]);
  const [alcoholItems, setAlcoholItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBarDetails = async () => {
      try {
        const [barData, menuData] = await Promise.all([
          api.barDetails(id as string),
          api.barMenu(id as string),
        ]);

        setBar(barData);
        const food = menuData.data?.food || [];
        const drink = menuData.data?.drink || [];
        const alcoholic = drink.filter((item: any) => item.isAlcoholic);
        const nonAlcoholic = drink.filter((item: any) => !item.isAlcoholic);

        setFoodItems(food);
        setAlcoholItems(alcoholic);
        setDrinkItems(nonAlcoholic);
        setMenu([...food, ...drink]);
      } catch (error) {
        console.error("Error al cargar detalles del bar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarDetails();
  }, [id]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aquí implementarías la lógica para guardar favoritos en tu API
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );

  // aqui se muestra la info del menu separado por categorias
  const renderMenuSection = (
    title: string,
    items: any[],
    iconName: React.ComponentProps<typeof Ionicons>["name"]
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>
          {title} ({items.length})
        </Text>
        <View style={styles.menuGrid}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={`${title}-${index}`}
              style={styles.menuItemWrapper}
              onPress={() => router.push(`/bars/drink/${item._id}`)}
            >
              <View style={styles.menuItem}>
                <View style={styles.menuImagePlaceholder}>
                  <Ionicons name={iconName} size={40} color="#FFA500" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.menuItemDescription} numberOfLines={2}>
                    {item.description || "Producto del bar"}
                  </Text>
                  <Text style={styles.menuItemPrice}>${item.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}></View>

      {/* Imagen y botones */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="beer" size={80} color="#FFA500" />
        </View>

        {/* irte pa atras */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        {/* favoritos */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#FFA500" : "white"}
          />
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
        {bar.description ||
          `${bar.name} son unos aburridos y no quisieron poner una descripción. ¿Su bebida será igual de aburrida?`}
      </Text>

      {/* secciones del menu */}
      {renderMenuSection("Comida", foodItems, "restaurant")}
      {renderMenuSection("Bebidas Alcohólicas", alcoholItems, "wine")}
      {renderMenuSection("Bebidas", drinkItems, "cafe")}
    </ScrollView>
  );
};

// esto es por q el grid se movio todo, ln le dije al v0 que lo arreglara y puso esto
const { width } = Dimensions.get("window");
const itemWidth = (width - 32) / 2;

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
  menuSection: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 8,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  menuItemWrapper: {
    width: "50%",
    padding: 8,
  },
  menuItem: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    height: 220, // Fixed height for consistency
  },
  menuImagePlaceholder: {
    backgroundColor: "#2A2A2A",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    padding: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    height: 32, // Fixed height for 2 lines
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFA500",
  },
});

export default BarDetails;
