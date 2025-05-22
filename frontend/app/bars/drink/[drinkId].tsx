import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import BarService from "../../../services/BarService";
import { Ionicons } from "@expo/vector-icons";

const DrinkDetails = () => {
  const { drinkId } = useLocalSearchParams<{ drinkId: string }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrink = async () => {
      try {
        const api = BarService.getInstance();
        const itemData = await api.getMenuItemById(drinkId);
        setItem(itemData);
      } catch (error) {
        console.error("Error al cargar bebida:", error);
      } finally {
        setLoading(false);
      }
    };

    if (drinkId) fetchDrink();
  }, [drinkId]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  if (!item) {
    return <Text style={styles.error}>No se encontró la bebida.</Text>;
  }

  const data = item.data ? item.data : item;
  const {
    name,
    description,
    price,
    isAlcoholic,
    alcoholPercentage,
    volume,
    category,
    servingTemperature,
  } = data;

  return (
    <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}></View>

        {/* placeholder de imagen */}
        <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
            <Ionicons name="beer" size={80} color="#FFA500" />
            </View>
        </View>

        {/* Boton para atras */}
        <TouchableOpacity style={styles.backButton} onPress={() => history.back()}>
            <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>

        
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description || "Sin descripción disponible."}</Text>

        <View style={styles.infoBox}>
            <Text style={styles.label}> Precio:</Text>
            <Text style={styles.value}>${price}</Text>
        </View>

        <View style={styles.infoBox}>
            <Text style={styles.label}> Volumen:</Text>
            <Text style={styles.value}>{volume} ml</Text>
        </View>

        <View style={styles.infoBox}>
            <Text style={styles.label}> Categoría:</Text>
            <Text style={styles.value}>{category}</Text>
        </View>

        <View style={styles.infoBox}>
            <Text style={styles.label}> ¿Alcohólica?:</Text>
            <Text style={styles.value}>{isAlcoholic ? "Sí" : "No"}</Text>
        </View>

        {isAlcoholic && (
            <View style={styles.infoBox}>
            <Text style={styles.label}> % Alcohol: </Text>
            <Text style={styles.value}>{alcoholPercentage}%</Text>
            </View>
        )}

        {!isAlcoholic && servingTemperature && (
            <View style={styles.infoBox}>
            <Text style={styles.label}> Temperatura:</Text>
            <Text style={styles.value}>{servingTemperature}</Text>
            </View>
        )}
        </ScrollView>
  );
};

export default DrinkDetails;

const styles = StyleSheet.create({
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  imageContainer: {
    width: "100%",
    height: 250,
    marginBottom: 16,
  },
  imagePlaceholder: {
    backgroundColor: "#2A2A2A",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#CCC",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    color: "#999",
    fontSize: 14,
  },
  value: {
    color: "#FFA500",
    fontSize: 14,
    fontWeight: "bold",
  },
});
