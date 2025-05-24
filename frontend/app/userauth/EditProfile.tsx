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
  Modal,
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
  const [imageKey, setImageKey] = useState(Date.now());
  const [userData, setUserData] = useState<UserData>({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    gender: user?.gender || "",
    image: user?.image || "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user?.image) {
      console.log("User image from context:", user.image);
      if (user.image.startsWith("http")) {
        setImageUri(user.image);
      } else {
        let imagePath = user.image;
        if (imagePath.startsWith("/")) {
          imagePath = imagePath.slice(1);
        }
        const fullUrl = `http://localhost:3000/${imagePath}`;
        setImageUri(fullUrl);
      }
    }
  }, [user]);

  const pickImage = async () => {
    if (Platform.OS === "web") {
      return new Promise<void>((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";

        const handleFileSelect = (event: Event) => {
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];

          const cleanup = () => {
            try {
              input.removeEventListener("change", handleFileSelect);
              if (document.body.contains(input)) {
                document.body.removeChild(input);
              }
            } catch (error) {
              console.log("Cleanup error:", error);
            }
          };

          if (!file) {
            cleanup();
            resolve();
            return;
          }

          if (!file.type.startsWith("image/")) {
            Alert.alert("Error", "Por favor selecciona una imagen válida");
            cleanup();
            resolve();
            return;
          }

          if (file.size > 5 * 1024 * 1024) {
            Alert.alert("Error", "La imagen debe ser menor a 5MB");
            cleanup();
            resolve();
            return;
          }

          setSelectedFile(file);
          const reader = new FileReader();

          reader.onload = (e) => {
            const result = e.target?.result as string;
            setImageUri(result);
            setImageKey(Date.now());
            cleanup();
            resolve();
          };

          reader.onerror = (error) => {
            console.error("FileReader error:", error);
            Alert.alert("Error", "No se pudo procesar la imagen");
            cleanup();
            resolve();
          };

          reader.readAsDataURL(file);
        };

        input.addEventListener("change", handleFileSelect);
        document.body.appendChild(input);
        input.click();
      });
    } else {
      try {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Error",
            "Se necesitan permisos para acceder a las fotos"
          );
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
          setImageKey(Date.now());
        }
      } catch (error) {
        console.error("Error picking image on mobile:", error);
        Alert.alert("Error", "No se pudo acceder a la galería");
      }
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === "web") {
      pickImage().catch((error) => {
        console.error("Error in pickImage:", error);
      });
    } else {
      Alert.alert("Seleccionar foto", "Elige una opción", [
        { text: "Cancelar", style: "cancel" },
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
      const apiService = ApiService.getInstance();
      let imageFile = null;

      if (Platform.OS === "web" && selectedFile) {
        imageFile = selectedFile;
      } else if (
        imageUri &&
        !imageUri.includes("localhost") &&
        Platform.OS !== "web"
      ) {
        imageFile = {
          uri: imageUri,
          type: "image/jpeg",
          name: "profile.jpg",
        } as any;
      }

      const updateData = {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        gender: userData.gender,
        currentPassword: showPasswordModal ? currentPassword : undefined,
        newPassword: showPasswordModal && newPassword ? newPassword : undefined,
      };

      const result = await apiService.updateUser(token!, updateData, imageFile);

      if (result.user) {
        updateUserContext(result.user);
        setImageKey(Date.now());
        setShowPasswordModal(false);

        Alert.alert("Éxito", "Perfil actualizado correctamente", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
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

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    handleUpdateProfile();
  };

  const getImageSource = () => {
    if (imageUri) {
      if (imageUri.includes("localhost")) {
        return { uri: `${imageUri}?v=${imageKey}` };
      }
      return { uri: imageUri };
    }
    return require("../../assets/images/placeholder.png");
  };

  const ProfileImageTouchable = () => (
    <TouchableOpacity
      onPress={showImageOptions}
      className="relative"
      activeOpacity={0.7}
      style={{ minWidth: 120, minHeight: 120 }}
    >
      <Image
        key={`profile-image-${imageKey}`}
        source={getImageSource()}
        className="w-30 h-30 rounded-full bg-gray-800"
        style={{ width: 120, height: 120 }}
        onError={(error) => console.log("Error loading image:", error)}
      />
      <View className="absolute bottom-0 right-0 bg-amber-600 rounded-full p-2">
        <MaterialIcons name="camera-alt" size={20} color="#fff" />
      </View>
    </TouchableOpacity>
  );

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
          <ProfileImageTouchable />
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
            />
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
            onPress={() => setShowPasswordModal(true)}
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

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70 p-4">
          <View className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
            <Text className="text-white text-xl font-bold mb-4">
              Cambiar contraseña
            </Text>

            <Text className="text-amber-500 text-sm font-semibold mb-2">
              Contraseña actual
            </Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              className="text-white bg-gray-800 rounded-lg p-3 mb-4"
              placeholder="Ingresa tu contraseña actual"
              placeholderTextColor="#6b7280"
              secureTextEntry={true}
            />

            <Text className="text-amber-500 text-sm font-semibold mb-2">
              Nueva contraseña
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              className="text-white bg-gray-800 rounded-lg p-3 mb-4"
              placeholder="Ingresa tu nueva contraseña"
              placeholderTextColor="#6b7280"
              secureTextEntry={true}
            />

            <Text className="text-amber-500 text-sm font-semibold mb-2">
              Confirmar nueva contraseña
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="text-white bg-gray-800 rounded-lg p-3 mb-6"
              placeholder="Confirma tu nueva contraseña"
              placeholderTextColor="#6b7280"
              secureTextEntry={true}
            />

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700"
              >
                <Text className="text-white">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={loading}
                className={`px-4 py-2 rounded-lg ${
                  loading ? "bg-gray-600" : "bg-amber-600"
                }`}
              >
                <Text className="text-white font-semibold">
                  {loading ? "Guardando..." : "Guardar cambios"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
