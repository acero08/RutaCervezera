"use client";

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import BarService from "../../services/BarService";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/ApiService";

const BarDetails = () => {
  const api = BarService.getInstance();
  const authApi = ApiService.getInstance();
  const { id } = useLocalSearchParams();
  const { user, token } = useAuth();
  const [bar, setBar] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [drinkItems, setDrinkItems] = useState<any[]>([]);
  const [alcoholItems, setAlcoholItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [userReview, setUserReview] = useState<any>(null);
  const router = useRouter();

  const { width } = Dimensions.get("window");
  const itemWidth = (width - 32) / 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barData, menuData, reviewsData] = await Promise.all([
          api.barDetails(id as string),
          api.barMenu(id as string),
          authApi.getBarReviews(id as string),
        ]);

        setBar(barData);
        setReviews(reviewsData.data || []);

        const food = menuData.data?.food || [];
        const drink = menuData.data?.drink || [];
        const alcoholic = drink.filter((item: any) => item.isAlcoholic);
        const nonAlcoholic = drink.filter((item: any) => !item.isAlcoholic);

        setFoodItems(food);
        setAlcoholItems(alcoholic);
        setDrinkItems(nonAlcoholic);

        if (user) {
          const userRev = reviewsData.data.find(
            (r: any) => r.user._id === user.id || r.user._id === user._id
          );
          setUserReview(userRev);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Lógica para guardar favoritos
  };

  const handleSubmitReview = async () => {
    if (!token) {
      Alert.alert("Error", "Debes iniciar sesión para dejar una reseña");
      return;
    }

    if (!reviewText.trim()) {
      Alert.alert("Error", "La reseña no puede estar vacía");
      return;
    }

    try {
      if (userReview) {
        const response = await authApi.editReview(
          userReview._id,
          token,
          rating,
          reviewText
        );
        setReviews(
          reviews.map((r) =>
            r._id === userReview._id ? response.data.review : r
          )
        );
        setUserReview(response.data.review);
      } else {
        const response = await authApi.createBarReview(
          id as string,
          token,
          rating,
          reviewText
        );
        setReviews([...reviews, response.data.review]);
        setUserReview(response.data.review);
      }

      setShowReviewModal(false);
      Alert.alert("Éxito", "Reseña guardada correctamente");
    } catch (error) {
      console.error("Error guardando reseña:", error);
      Alert.alert("Error", "No se pudo guardar la reseña");
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      await authApi.deleteReview(userReview._id, token!);
      setReviews(reviews.filter((r) => r._id !== userReview._id));
      setUserReview(null);
      setShowReviewModal(false);
      Alert.alert("Éxito", "Reseña eliminada correctamente");
    } catch (error) {
      console.error("Error eliminando reseña:", error);
      Alert.alert("Error", "No se pudo eliminar la reseña");
    }
  };

  const renderStars = (value: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            disabled={!!userReview}
          >
            <Ionicons
              name={star <= value ? "star" : "star-outline"}
              size={28}
              color="#FFA500"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReview = (review: any) => (
    <View key={review._id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Ionicons name="person-circle" size={24} color="#FFA500" />
        <Text style={styles.reviewAuthor}>{review.user.name}</Text>
        <View style={styles.reviewRating}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < review.rating ? "star" : "star-outline"}
              size={16}
              color="#FFA500"
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewText}>{review.comment}</Text>
      {user &&
        (user.id === review.user._id || user._id === review.user._id) && (
          <View style={styles.reviewActions}>
            <TouchableOpacity
              onPress={() => {
                setRating(review.rating);
                setReviewText(review.comment);
                setShowReviewModal(true);
              }}
            >
              <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteReview}>
              <Text style={[styles.actionText, styles.deleteText]}>
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );

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

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}></View>

      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="beer" size={80} color="#FFA500" />
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

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

      <View style={styles.ratingContainer}>
        <View style={styles.ratingItem}>
          <Ionicons name="star" size={18} color="#FFA500" />
          <Text style={styles.ratingText}>{bar.rating}</Text>
        </View>
      </View>

      <Text style={styles.barName}>{bar.name}</Text>

      <Text style={styles.description}>
        {bar.description ||
          `${bar.name} son unos aburridos y no quisieron poner una descripción. ¿Su bebida será igual de aburrida?`}
      </Text>

      {renderMenuSection("Comida", foodItems, "restaurant")}
      {renderMenuSection("Bebidas Alcohólicas", alcoholItems, "wine")}
      {renderMenuSection("Bebidas", drinkItems, "cafe")}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reseñas ({reviews.length})</Text>
          <TouchableOpacity
            onPress={() =>
              user ? setShowReviewModal(true) : router.push("/userauth/Login")
            }
            style={styles.addReviewButton}
          >
            <Ionicons name="pencil" size={20} color="#FFA500" />
            <Text style={styles.addReviewText}>
              {userReview ? "Editar tu reseña" : "Escribe una reseña"}
            </Text>
          </TouchableOpacity>
        </View>

        {reviews.length > 0 ? (
          <>
            {reviews.slice(0, 3).map(renderReview)}
            {reviews.length > 3 && (
              <TouchableOpacity
                onPress={() => router.push(`/bars/${id}/reviews`)}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>
                  Ver todas las reseñas ({reviews.length})
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.noReviews}>
            Sé el primero en dejar una reseña
          </Text>
        )}
      </View>

      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {userReview ? "Editar Reseña" : "Nueva Reseña"}
            </Text>

            {renderStars(rating)}

            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              placeholder="Escribe tu reseña aquí..."
              placeholderTextColor="#666"
              value={reviewText}
              onChangeText={setReviewText}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReview}
              >
                <Text style={styles.buttonText}>
                  {userReview ? "Actualizar" : "Publicar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

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
    height: 220,
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
    height: 32,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFA500",
  },
  section: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  addReviewText: {
    color: "#FFA500",
    fontWeight: "bold",
  },
  reviewCard: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  reviewAuthor: {
    color: "white",
    fontWeight: "bold",
  },
  reviewRating: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  reviewText: {
    color: "#CCC",
    fontSize: 14,
    lineHeight: 20,
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 12,
  },
  actionText: {
    color: "#FFA500",
    fontWeight: "bold",
  },
  deleteText: {
    color: "#FF3B30",
  },
  noReviews: {
    color: "#666",
    textAlign: "center",
    padding: 16,
  },
  seeAllButton: {
    marginTop: 12,
    padding: 8,
  },
  seeAllText: {
    color: "#FFA500",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 16,
  },
  reviewInput: {
    backgroundColor: "#2A2A2A",
    color: "white",
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#333",
  },
  submitButton: {
    backgroundColor: "#FFA500",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default BarDetails;
