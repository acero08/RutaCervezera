import { View, Text, ScrollView, ActivityIndicator, TextInput, Button, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import BarService from "../../services/BarService";


const BarDetails = () => {
  const { id } = useLocalSearchParams(); // El ID del bar desde la URL
  const api = BarService.getInstance();

  const [bar, setBar] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        setMenu([...food, ...drink]);
      } catch (error) {
        console.error("Error al cargar detalles del bar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarDetails();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color="#FF6600" />;


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{bar.name}</Text>
      <Text>{bar.address}</Text>
      <Text>Tel: {bar.phonenumber}</Text>
      <Text>Rating: {bar.rating}</Text>

      <Text style={styles.sectionTitle}>Menú</Text>
      {menu && menu.length > 0 ? (
        menu.map((item, index) => (
          <Text key={index}>• {item.name} - ${item.price}</Text>
        ))
      ) : (
        <Text>Este bar no tiene menú disponible.</Text>
      )}
    </ScrollView>
  );
};

// Misma onda le dije a chatgpt q le diera formato
const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  sectionTitle: { marginTop: 24, fontWeight: "bold", fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 8,
    marginBottom: 12,
    padding: 8,
    borderRadius: 6,
  },
});


export default BarDetails;
