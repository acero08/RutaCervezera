import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import BarService from "../../services/BarService";
import { useRouter } from "expo-router";

const BarsScreen = () => {
  const [bars, setBars] = useState<any[]>([]);
  const [filteredBars, setFilteredBars] = useState<any[]>([]); // Estado para los bares filtrados
  const [searchQuery, setSearchQuery] = useState(""); // Barra de busqueda vacia por default para que se muestren tdos 
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Router para navegar entre bares
  const api = BarService.getInstance(); // API con instrucciones para los bares

  // Carga los bares
  useEffect(() => {
    const fetchBars = async () => {
      try {
        const data = await api.getAllBars();
        setBars(data);
        setFilteredBars(data); 
      } catch (error) {
        console.error("Error al obtener los bares:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBars();
  }, []);

  // Instrucciones de la barra de busqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredBars(bars); 
    } else {
      const filtered = bars.filter((bar) =>
        bar.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBars(filtered);
    }
  };

  // loading 
  if (loading) {
    return <ActivityIndicator size="large" color="#FFA500" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      {/* Barra de búsqueda */}
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar bares..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Lista de bares */}
      <FlatList
        data={filteredBars}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => router.push(`/bars/${item._id}`)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.address}</Text>
              <Text>Tel: {item.phonenumber}</Text>
              <Text>Rating: {item.rating}</Text>
              {/* Tengo que preguntarte como va funcionar ese pedo de las imágenes */}
              {/* {item.image && (
                <Image
                  source={{  }}
                  style={styles.image}
                />
              )} */}
          </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

{/* Esto es por que no se como cambiar todo el layout y le dije a chatgpt que me lo hiciera bonito */}
const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: "#FFF",
    padding: 10,
    margin: 16,
    borderRadius: 8,
    borderColor: "#DDD",
    borderWidth: 1,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 180,
    marginTop: 8,
    borderRadius: 8,
  },
});

export default BarsScreen;
