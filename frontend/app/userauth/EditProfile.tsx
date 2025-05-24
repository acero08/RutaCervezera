"use client";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import ApiService from "../../services/ApiService";

interface UserData {
  name: string;
  email: string;
  mobile: string;
  gender: string;
  image?: string;
}

export default function EditProfile() {
  const router = useRouter();
  const { user, token, updateUserContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    gender: user?.gender || "",
    image: user?.image || "",
  });

  useEffect(() => {
    // Set initial image URI based on user data
    if (user?.image) {
      console.log("User image from context:", user.image);

      // Check if it's already a full URL
      if (user.image.startsWith("http")) {
        setImageUri(user.image);
      } else {
        // Handle the image path from database
        let imagePath = user.image;

        // Remove leading slash if present
        if (imagePath.startsWith("/")) {
          imagePath = imagePath.slice(1);
        }

        // Construct full URL
        const fullUrl = `http://localhost:3000/${imagePath}`;
        console.log("Constructed image URL:", fullUrl);
        setImageUri(fullUrl);
      }
    }
  }, [user]);

  const pickImage = async () => {
    if (Platform.OS === "web") {
      console.log("Web image picker called");

      // Create a proper file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = (event: any) => {
        const file = event.target.files[0];
        console.log("File selected:", file);

        if (file) {
          // Validate file type
          if (!file.type.startsWith("image/")) {
            Alert.alert("Error", "Por favor selecciona una imagen válida");
            return;
          }

          // Validate file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            Alert.alert("Error", "La imagen debe ser menor a 5MB");
            return;
          }

          console.log("File is valid, processing...");

          // Store the actual File object for upload
          setSelectedFile(file);

          // Create preview URL using FileReader
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            console.log("Image preview created");
            setImageUri(result);
          };
          reader.onerror = (error) => {
            console.error("FileReader error:", error);
            Alert.alert("Error", "No se pudo procesar la imagen");
          };
          reader.readAsDataURL(file);
        }
      };

      // Clean up any previous input
      input.value = "";
      input.click();
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Se necesitan permisos para acceder a las fotos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setSelectedFile(null);
      }
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Error", "La cámara no está disponible en la versión web");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Se necesitan permisos para acceder a la cámara");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setSelectedFile(null);
    }
  };

  const showImageOptions = () => {
    console.log("Camera icon clicked");
    if (Platform.OS === "web") {
      Alert.alert("Seleccionar foto", "Elige una opción", [
        { text: "Cancelar", style: "cancel" },
        { text: "Elegir archivo", onPress: pickImage },
      ]);
    } else {
      Alert.alert("Seleccionar foto", "Elige una opción", [
        { text: "Cancelar", style: "cancel" },
        { text: "Tomar foto", onPress: takePhoto },
        { text: "Elegir de galería", onPress: pickImage },
      ]);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userData.name.trim()) {
      Alert.alert("Error", "El nombre es requerido");
      return;
    }

    setLoading(true);
    try {
      console.log("Starting profile update...");
      const apiService = ApiService.getInstance();

      let imageFile = null;

      if (Platform.OS === "web" && selectedFile) {
        console.log("Using selected file for web:", selectedFile.name);
        imageFile = selectedFile;
      } else if (
        imageUri &&
        !imageUri.includes("localhost") &&
        Platform.OS !== "web"
      ) {
        console.log("Using image URI for mobile:", imageUri);
        imageFile = {
          uri: imageUri,
          type: "image/jpeg",
          name: "profile.jpg",
        } as any;
      }

      console.log("Calling API updateUser with imageFile:", !!imageFile);

      const result = await apiService.updateUser(
        token!,
        {
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          gender: userData.gender,
        },
        imageFile
      );

      console.log("API result:", result);

      // Update context with the returned user data
      if (result.user) {
        updateUserContext(result.user);
        console.log("User context updated");
      }

      Alert.alert("Éxito", "Perfil actualizado correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "No se pudo actualizar el perfil";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get display image source
  const getImageSource = () => {
    if (imageUri) {
      console.log("Displaying image:", imageUri);
      return { uri: imageUri };
    }
    console.log("Using placeholder image");
    return require("../../assets/images/placeholder.png");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#121212" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-gray-800 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold flex-1">
          Editar Perfil
        </Text>
        <TouchableOpacity
          onPress={handleUpdateProfile}
          disabled={loading}
          className={`px-4 py-2 rounded-lg ${
            loading ? "bg-gray-600" : "bg-amber-600"
          }`}
        >
          <Text className="text-white font-semibold">
            {loading ? "Guardando..." : "Guardar"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Profile Picture Section */}
        <View className="items-center py-6">
          <TouchableOpacity onPress={showImageOptions} className="relative">
            <Image
              source={getImageSource()}
              className="w-30 h-30 rounded-full bg-gray-800"
              style={{ width: 120, height: 120 }}
              onError={(error) => {
                console.log("Error loading image:", error);
              }}
              onLoad={() => {
                console.log("Image loaded successfully");
              }}
            />
            <View className="absolute bottom-0 right-0 bg-amber-600 rounded-full p-2">
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-400 mt-2 text-center">
            Toca para cambiar tu foto de perfil
          </Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          {/* Name Field */}
          <View className="bg-gray-900 rounded-xl p-4">
            <Text className="text-amber-500 text-sm font-semibold mb-2">
              Nombre
            </Text>
            <TextInput
              value={userData.name}
              onChangeText={(text) =>
                setUserData((prev) => ({ ...prev, name: text }))
              }
              className="text-white text-lg"
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#6b7280"
            />
          </View>

          {/* Email Field */}
          <View className="bg-gray-900 rounded-xl p-4">
            <Text className="text-amber-500 text-sm font-semibold mb-2">
              Email
            </Text>
            <TextInput
              value={userData.email}
              onChangeText={(text) =>
                setUserData((prev) => ({ ...prev, email: text }))
              }
              className="text-white text-lg"
              placeholder="Ingresa tu email"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Text className="text-gray-500 text-xs mt-1">
              El email no se puede modificar
            </Text>
          </View>

          {/* Mobile Field */}
          <View className="bg-gray-900 rounded-xl p-4">
            <Text className="text-amber-500 text-sm font-semibold mb-2">
              Teléfono
            </Text>
            <TextInput
              value={userData.mobile}
              onChangeText={(text) =>
                setUserData((prev) => ({ ...prev, mobile: text }))
              }
              className="text-white text-lg"
              placeholder="Ingresa tu número de teléfono"
              placeholderTextColor="#6b7280"
              keyboardType="phone-pad"
            />
          </View>

          {/* Gender Field */}
          <View className="bg-gray-900 rounded-xl p-4">
            <Text className="text-amber-500 text-sm font-semibold mb-3">
              Género
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() =>
                  setUserData((prev) => ({ ...prev, gender: "male" }))
                }
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  userData.gender === "male"
                    ? "border-amber-500 bg-amber-900/30"
                    : "border-gray-600"
                }`}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialIcons
                    name="male"
                    size={20}
                    color={userData.gender === "male" ? "#f59e0b" : "#6b7280"}
                  />
                  <Text
                    className={`ml-2 ${
                      userData.gender === "male"
                        ? "text-amber-500"
                        : "text-gray-400"
                    }`}
                  >
                    Masculino
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setUserData((prev) => ({ ...prev, gender: "female" }))
                }
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  userData.gender === "female"
                    ? "border-amber-500 bg-amber-900/30"
                    : "border-gray-600"
                }`}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialIcons
                    name="female"
                    size={20}
                    color={userData.gender === "female" ? "#f59e0b" : "#6b7280"}
                  />
                  <Text
                    className={`ml-2 ${
                      userData.gender === "female"
                        ? "text-amber-500"
                        : "text-gray-400"
                    }`}
                  >
                    Femenino
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            className="bg-gray-900 rounded-xl p-4 flex-row items-center justify-between"
            onPress={() => {
              Alert.alert(
                "Próximamente",
                "Función de cambio de contraseña en desarrollo"
              );
            }}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="lock" size={22} color="#d97706" />
              <Text className="text-white ml-3">Cambiar contraseña</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
