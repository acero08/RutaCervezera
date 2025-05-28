import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import BarService from "../../services/BarService";
import { useEffect, useState } from "react";

interface Bar {
  _id: string;
  name: string;
  description?: string;
  averageRating?: number;
}

const FavoritesScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const barService = BarService.getInstance();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      if (user?._id) {
        const userFavorites = await barService.getUserFavorites(user._id);
        setFavorites(userFavorites);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarPress = (barId: string) => {
    router.push(`/bars/${barId}` as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Favoritos</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.favoriteItem}
            onPress={() => handleBarPress(item._id)}
          >
            <View style={styles.favoriteImagePlaceholder}>
              <Ionicons name="beer" size={32} color="#FFA500" />
            </View>
            <View style={styles.favoriteContent}>
              <Text style={styles.favoriteName}>{item.name}</Text>
              <Text style={styles.favoriteDescription} numberOfLines={2}>
                {item.description || "Sin descripción disponible"}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFA500" />
                <Text style={styles.ratingText}>{item.averageRating?.toFixed(1) || "0.0"}</Text>
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
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push("/collection" as any)}
            >
              <Text style={styles.exploreButtonText}>Explorar bares</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
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
  },
  emptySubtitle: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FavoritesScreen;