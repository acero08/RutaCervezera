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
  const [bar, setBar] = useState<any>({});
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
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [reviewsError, setReviewsError] = useState(false);

  const { width } = Dimensions.get("window");
  const itemWidth = (width - 32) / 2;

  // Utility functions that can be used by both components
  const canEditReview = (review: any) => {
    if (!user || !review || !review.user) {
      console.log("Missing user or review data");
      return false;
    }

    // Obtener IDs para comparar
    const currentUserId = user.id || user._id;
    const reviewUserId = review.user._id || review.user.id;

    console.log("Review permission check:", {
      currentUserId,
      reviewUserId,
      canEdit: currentUserId === reviewUserId,
    });

    return currentUserId === reviewUserId;
  };

  const canEditComment = (comment: any) => {
    if (!user || !comment || !comment.user) {
      console.log("Missing user or comment data");
      return false;
    }

    // Obtener IDs para comparar
    const currentUserId = user.id || user._id;
    const commentUserId = comment.user._id || comment.user.id;

    console.log("Comment permission check:", {
      currentUserId,
      commentUserId,
      canEdit: currentUserId === commentUserId,
    });

    return currentUserId === commentUserId;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);

      try {
        // Cargar datos del bar y menú primero
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

        // Cargar reseñas por separado con mejor manejo de errores
        try {
          const reviewsData = await authApi.getBarReviews(id as string);

          console.log("Reviews data received:", reviewsData);

          if (reviewsData && reviewsData.success !== false) {
            const reviewsList = reviewsData.data || [];
            setReviews(reviewsList);
            setReviewsError(false);

            // Buscar reseña del usuario actual
            if (user && reviewsList.length > 0) {
              const userRev = reviewsList.find(
                (r: any) => r.user?._id === user.id || r.user?._id === user._id
              );
              setUserReview(userRev || null);
            }
          } else {
            console.log("No reviews found or error in response");
            setReviews([]);
            setReviewsError(false);
          }
        } catch (reviewError: any) {
          console.error("Error cargando reseñas:", reviewError);
          setReviews([]);
          setReviewsError(true);

          // Manejo más específico de errores
          if (reviewError.response?.status === 404) {
            // Bar sin reseñas - no es un error
            setReviews([]);
            setReviewsError(false);
          } else if (reviewError.response?.status >= 500) {
            // Error del servidor
            setReviewsError(true);
            setReviews([]);
          } else if (reviewError.message?.includes("Network")) {
            // Error de red
            setReviewsError(true);
            setReviews([]);
          } else {
            // Otros errores - mostrar como vacío pero no como error
            setReviews([]);
            setReviewsError(false);
          }
        }
      } catch (error: any) {
        console.error("Error cargando datos del bar:", error);
        Alert.alert("Error", "No se pudieron cargar los datos del bar");
        setBar({});
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

  const handleViewComments = async (review: any) => {
    if (!review || !review._id) {
      Alert.alert("Error", "Reseña no válida");
      return;
    }

    if (!token) {
      Alert.alert("Error", "Debes iniciar sesión para ver comentarios");
      return;
    }

    const commentsResponse = await authApi.getComments(review._id);

    console.log("Comentarios recibidos:", commentsResponse);

    try {
      const commentsResponse = await authApi.getComments(review._id);
      console.log("Comments response:", commentsResponse);

      const comments = commentsResponse?.data || [];

      setSelectedReview({
        ...review,
        comments: comments,
      });

      // NUEVO: Actualizar también el review en la lista principal
      setReviews((prevReviews) =>
        prevReviews.map((r) =>
          r._id === review._id
            ? { ...r, comments: comments, commentCount: comments.length }
            : r
        )
      );

      setShowCommentsModal(true);
    } catch (error: any) {
      console.error("Error fetching comments:", error),
        {
          message: error.message,
          stack: error.stack,
          reviewId: review?._id,
        };

      if (error.response?.status === 404) {
        setSelectedReview({
          ...review,
          comments: [],
        });
        setShowCommentsModal(true);
        return;
      }

      Alert.alert("Error", error.message || "Error cargando comentarios");
    }
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

    if (rating < 1 || rating > 5) {
      Alert.alert("Error", "La calificación debe estar entre 1 y 5 estrellas");
      return;
    }

    // Prevenir múltiples envíos
    if (loading) return;
    setLoading(true);

    try {
      let response: any;

      if (userReview) {
        // Actualizar reseña existente
        response = await authApi.editReview(
          userReview._id,
          token,
          rating,
          reviewText.trim()
        );

        // Actualizar la lista de reseñas
        setReviews((prevReviews) =>
          prevReviews.map((r) =>
            r._id === userReview._id ? response.data?.review || response : r
          )
        );
        setUserReview(response.data?.review || response);
        Alert.alert("Éxito", "Reseña actualizada correctamente");
      } else {
        // Crear nueva reseña
        response = await authApi.createBarReview(
          id as string,
          token,
          rating,
          reviewText.trim()
        );

        const newReview = response.data?.review || response;

        // Añadir la nueva reseña a la lista
        setReviews((prevReviews) => [newReview, ...prevReviews]);
        setUserReview(newReview);
        Alert.alert("Éxito", "Reseña creada correctamente");
      }

      // Limpiar y cerrar modal
      setShowReviewModal(false);
      setReviewText("");
      setRating(5);
    } catch (error: any) {
      console.error("Error guardando reseña:", error);

      let errorMessage = "No se pudo guardar la reseña";

      // Manejo específico de mensajes de error
      if (error.message) {
        if (error.message.includes("timeout")) {
          errorMessage =
            "La conexión tardó demasiado. Intenta con una reseña más corta.";
        } else if (error.message.includes("Network")) {
          errorMessage = "Error de conexión. Verifica tu internet.";
        } else if (error.message.includes("Server error")) {
          errorMessage = "Error del servidor. Intenta más tarde.";
        } else {
          errorMessage = error.message;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función handleUpvote consolidada (eliminé la duplicada)
  const handleUpvote = async (review: any) => {
    if (!token) {
      Alert.alert("Error", "Debes iniciar sesión para votar");
      return;
    }

    if (!review || !review._id) {
      Alert.alert("Error", "Reseña no válida");
      return;
    }

    try {
      const response = await authApi.upvoteReview(review._id, token);

      // Actualizar el conteo de upvotes en la reseña específica
      setReviews((prevReviews) =>
        prevReviews.map((r) => {
          if (r._id === review._id) {
            return {
              ...r,
              upvotes: response.count || 0,
            };
          }
          return r;
        })
      );
    } catch (error: any) {
      console.error("Error al votar:", error);

      let errorMessage = "No se pudo procesar el voto";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview || !token) return;

    try {
      await authApi.deleteReview(userReview._id, token);
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

  const renderReview = (review: any) => {
    if (!review) return null;

    return (
      <View key={review._id} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Ionicons name="person-circle" size={24} color="#FFA500" />
          <Text style={styles.reviewAuthor}>
            {review.user?.name || review.user?.username || "Usuario"}
          </Text>
          <View style={styles.reviewRating}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < (review.rating || 0) ? "star" : "star-outline"}
                size={16}
                color="#FFA500"
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewText}>{review.comment || ""}</Text>

        <View style={styles.interactionContainer}>
          <TouchableOpacity
            style={styles.upvoteButton}
            onPress={() => handleUpvote(review)}
          >
            <Ionicons name="arrow-up" size={20} color="#FFA500" />
            <Text style={styles.upvoteCount}>{review.upvotes || 0}</Text>
          </TouchableOpacity>
          {/*
          <TouchableOpacity
            style={styles.commentButton}
            onPress={() => handleViewComments(review)}
          >
            <Ionicons name="chatbubbles" size={18} color="#FFA500" />
            <Text style={styles.commentCount}>{review.commentCount || 0}</Text>
          </TouchableOpacity>
          */}
        </View>

        {/* Solo mostrar acciones de editar/eliminar al autor de la reseña */}
        {canEditReview(review) && (
          <View style={styles.reviewActions}>
            <TouchableOpacity
              onPress={() => {
                setRating(review.rating || 5);
                setReviewText(review.comment || "");
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
  };

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
          <Text style={styles.ratingText}>{bar?.rating || "0.0"}</Text>
        </View>
      </View>

      <Text style={styles.barName}>{bar?.name || "Nombre no disponible"}</Text>

      <Text style={styles.description}>
        {bar.description ||
          `${bar.name} son unos aburridos y no quisieron poner una descripción. ¿Su bebida será igual de aburrida?`}
      </Text>

      {renderMenuSection("Comida", foodItems, "restaurant")}
      {renderMenuSection("Bebidas Alcohólicas", alcoholItems, "wine")}
      {renderMenuSection("Bebidas", drinkItems, "cafe")}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Reseñas {!reviewsError && `(${reviews.length})`}
          </Text>
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

        {reviewsError ? (
          <Text style={styles.errorText}>
            No se pudieron cargar las reseñas. Inténtalo más tarde.
          </Text>
        ) : reviews.length > 0 ? (
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
                onPress={() => {
                  setShowReviewModal(false);
                  setReviewText("");
                  setRating(5);
                }}
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

      <CommentsModal
        visible={showCommentsModal}
        onClose={() => {
          setShowCommentsModal(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onCommentSubmit={(comment) => {
          if (selectedReview) {
            const newCommentObj = {
              _id: Date.now().toString(),
              content: comment,
              user: user,
              createdAt: new Date().toISOString(),
            };

            // Actualizar selectedReview
            setSelectedReview({
              ...selectedReview,
              comments: [newCommentObj, ...(selectedReview.comments || [])],
            });

            // NUEVO: Actualizar también el review en la lista principal
            setReviews((prevReviews) =>
              prevReviews.map((r) =>
                r._id === selectedReview._id
                  ? {
                      ...r,
                      commentCount: (r.commentCount || 0) + 1,
                      comments: [newCommentObj, ...(r.comments || [])],
                    }
                  : r
              )
            );
          }
        }}
        canEditComment={canEditComment}
      />
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
  interactionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    marginTop: 10,
  },
  upvoteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  upvoteCount: {
    color: "#FFA500",
    fontWeight: "bold",
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  commentCount: {
    color: "#FFA500",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    backgroundColor: "#2A2A2A",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    color: "#FFA500",
    fontWeight: "bold",
    marginBottom: 4,
  },
  commentText: {
    color: "#FFF",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    color: "#FFF",
    borderRadius: 20,
    padding: 12,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
    padding: 16,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    gap: 8,
  },
  commentActionButton: {
    padding: 4,
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    backgroundColor: "#333",
    color: "#FFF",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  saveButton: {
    backgroundColor: "#FFA500",
  },
});

export default BarDetails;
// Reemplaza la función CommentsModal completa (líneas 750-850 aproximadamente)

const CommentsModal = ({
  visible,
  onClose,
  review,
  onCommentSubmit,
  canEditComment,
}: {
  visible: boolean;
  onClose: () => void;
  review: any;
  onCommentSubmit: (comment: string) => void;
  canEditComment: (comment: any) => boolean;
}) => {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const { user, token } = useAuth();

  // Actualizar comentarios cuando cambie la review
  useEffect(() => {
    if (review?.comments) {
      setComments(review.comments);
    }
  }, [review]);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert("Error", "Debes iniciar sesión para comentar");
      return;
    }

    if (!newComment.trim()) {
      Alert.alert("Error", "El comentario no puede estar vacío");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await ApiService.getInstance().postComment(
        review?._id,
        token,
        newComment.trim()
      );

      const newCommentObj = {
        _id: response._id || Date.now().toString(),
        content: newComment.trim(),
        user: user,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [newCommentObj, ...prev]);
      onCommentSubmit(newComment.trim());
      setNewComment("");
    } catch (error: any) {
      console.error("Error posting comment:", error);
      Alert.alert("Error", error.message || "No se pudo enviar el comentario");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!token || !editText.trim()) {
      Alert.alert("Error", "El comentario no puede estar vacío");
      return;
    }

    try {
      await ApiService.getInstance().editComment(
        commentId,
        token,
        editText.trim()
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? { ...comment, content: editText.trim() }
            : comment
        )
      );

      setEditingComment(null);
      setEditText("");
      Alert.alert("Éxito", "Comentario actualizado");
    } catch (error: any) {
      console.error("Error editing comment:", error);
      Alert.alert("Error", error.message || "No se pudo editar el comentario");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;

    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este comentario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await ApiService.getInstance().deleteComment(commentId, token);
              setComments((prev) =>
                prev.filter((comment) => comment._id !== commentId)
              );
              Alert.alert("Éxito", "Comentario eliminado");
            } catch (error: any) {
              console.error("Error deleting comment:", error);
              Alert.alert(
                "Error",
                error.message || "No se pudo eliminar el comentario"
              );
            }
          },
        },
      ]
    );
  };

  const startEdit = (comment: any) => {
    setEditingComment(comment._id);
    setEditText(comment.content || comment.text || "");
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };

  if (!visible || !review) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comentarios</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFA500" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.commentsList}>
            {comments && comments.length > 0 ? (
              comments.map((comment: any) => (
                <View
                  key={comment._id || comment.id || Math.random()}
                  style={styles.commentItem}
                >
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {comment.user?.name ||
                        comment.user?.username ||
                        "Usuario"}
                    </Text>
                    {/* Solo mostrar acciones de editar/eliminar al autor del comentario */}
                    {canEditComment(comment) && (
                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          onPress={() => startEdit(comment)}
                          style={styles.commentActionButton}
                        >
                          <Ionicons name="pencil" size={16} color="#FFA500" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment._id)}
                          style={styles.commentActionButton}
                        >
                          <Ionicons name="trash" size={16} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {editingComment === comment._id ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        multiline
                        value={editText}
                        onChangeText={setEditText}
                        placeholder="Editar comentario..."
                        placeholderTextColor="#666"
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          onPress={cancelEdit}
                          style={[styles.editButton, styles.cancelButton]}
                        >
                          <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleEditComment(comment._id)}
                          style={[styles.editButton, styles.saveButton]}
                        >
                          <Text style={styles.buttonText}>Guardar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.commentText}>
                      {comment.content || comment.text || ""}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>No hay comentarios aún</Text>
            )}
          </ScrollView>

          {user && (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Escribe un comentario..."
                placeholderTextColor="#666"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
                editable={!submitting}
              />
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!newComment.trim() || submitting}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={newComment.trim() && !submitting ? "#FFA500" : "#666"}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
