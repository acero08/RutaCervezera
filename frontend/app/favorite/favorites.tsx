import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router";

// Mock data for favorites
const MOCK_FAVORITES = [
  {
    id: "1",
    name: "El Cantinero",
    description: "Bar tradicional con amplia selección de tequilas y mezcales.",
    rating: 4.7
  },
  {
    id: "2",
    name: "Cervecería Moderna",
    description: "Cervezas artesanales y ambiente relajado.",
    rating: 4.5
  },
  {
    id: "3",
    name: "La Bodega",
    description: "Vinos selectos y tapas gourmet en un ambiente elegante.",
    rating: 4.8
  },
  {
    id: "4",
    name: "Pub Irlandés",
    description: "Auténtica experiencia irlandesa con música en vivo.",
    rating: 4.2
  },
  {
    id: "5",
    name: "Coctelería Urbana",
    description: "Cócteles de autor y música electrónica.",
    rating: 4.6
  }
];

const FavoritesScreen = () => {
const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}> </Text>
      </View>
      
    {/* irte pa atras */}
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="white" />
    </TouchableOpacity>

      <FlatList
        data={MOCK_FAVORITES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.favoriteItem}>
            <View style={styles.favoriteImagePlaceholder}>
              <Ionicons name="beer" size={32} color="#FFA500" />
            </View>
            <View style={styles.favoriteContent}>
              <Text style={styles.favoriteName}>{item.name}</Text>
              <Text style={styles.favoriteDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFA500" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.favoriteAction}>
              <Ionicons name="heart" size={24} color="#FFA500" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Tus Bares Favoritos</Text>
            <Text style={styles.infoText}>
              Aquí encontrarás todos los bares que has marcado como favoritos.
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No tienes favoritos</Text>
            <Text style={styles.emptySubtitle}>
              Explora bares y añádelos a tus favoritos para verlos aquí
            </Text>
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Explorar bares</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#CCC",
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  favoriteItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  favoriteImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  favoriteContent: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  favoriteDescription: {
    fontSize: 14,
    color: "#999",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "white",
    marginLeft: 4,
    fontSize: 14,
  },
  favoriteAction: {
    padding: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#333",
    marginLeft: 88,
  },
  emptyContainer: {
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default FavoritesScreen