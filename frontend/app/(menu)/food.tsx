import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Alert, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';
import { useNavigation } from '@react-navigation/native';

interface FoodItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isVegetarian: boolean;
  hasGluten: boolean;
  calories?: number;
  category: string;
}

export default function FoodScreen() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ uri: string } | null>(null);
  const [newItem, setNewItem] = useState<FoodItem>({
    name: '',
    description: '',
    price: 0,
    isVegetarian: false,
    hasGluten: false,
    calories: undefined,
    category: 'entrada'
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const api = ApiService.getInstance();
  const navigation = useNavigation();

  useEffect(() => {
    loadFood();
  }, []);

  const loadFood = async () => {
    try {
      const response = await api.getBarMenu();
      setFoodItems(response.data.food || []);
    } catch (error) {
      console.error('Error loading food:', error);
      Alert.alert('Error', 'No se pudieron cargar los alimentos');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage({ uri: result.assets[0].uri });
    }
  };

  const handleAddFood = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('description', newItem.description);
      formData.append('price', newItem.price.toString());
      formData.append('isVegetarian', newItem.isVegetarian.toString());
      formData.append('hasGluten', newItem.hasGluten.toString());
      if (newItem.calories) {
        formData.append('calories', newItem.calories.toString());
      }
      formData.append('category', newItem.category);

      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'food_image.jpg'
        } as any);
      }

      const response = await api.createFoodItem(formData);
      
      if (response.success) {
        Alert.alert('Éxito', 'Ítem de comida creado correctamente');
        setModalVisible(false);
        loadFood();
        setNewItem({
          name: '',
          description: '',
          price: 0,
          isVegetarian: false,
          hasGluten: false,
          calories: undefined,
          category: 'entrada'
        });
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error al crear ítem de comida:', error);
      Alert.alert('Error', 'No se pudo crear el ítem de comida');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#FFA500" />
        </TouchableOpacity>
        <Text style={styles.title}>Alimentos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.foodList}>
        {foodItems.map((food) => (
          <View key={food._id} style={styles.foodItem}>
            {food.image ? (
              <Image source={{ uri: food.image }} style={styles.foodImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="restaurant" size={40} color="#FFA500" />
              </View>
            )}
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodPrice}>${food.price.toFixed(2)}</Text>
              <View style={styles.foodTags}>
                {food.isVegetarian && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Vegetariano</Text>
                  </View>
                )}
                {!food.hasGluten && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Sin Gluten</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={24} color="#FFA500" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modal con nuevo estilo */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nuevo Alimento</Text>

            <TextInput
              placeholder="Nombre"
              placeholderTextColor="#888"
              style={styles.input}
              value={newItem.name}
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            />

            <TextInput
              placeholder="Descripción"
              placeholderTextColor="#888"
              style={styles.input}
              value={newItem.description}
              onChangeText={(text) => setNewItem({ ...newItem, description: text })}
            />

            <TextInput
              placeholder="Precio (ej. 25.50)"
              placeholderTextColor="#888"
              style={styles.input}
              keyboardType="decimal-pad"
              value={newItem.price ? newItem.price.toString() : ''}
              onChangeText={(text) => setNewItem({ ...newItem, price: parseFloat(text) || 0 })}
            />

            <TextInput
              placeholder="Calorías (opcional)"
              placeholderTextColor="#888"
              style={styles.input}
              keyboardType="numeric"
              value={newItem.calories ? newItem.calories.toString() : ''}
              onChangeText={(text) => setNewItem({ ...newItem, calories: parseInt(text) || undefined })}
            />

            <TextInput
              placeholder="Categoría (ej. entrada)"
              placeholderTextColor="#888"
              style={styles.input}
              value={newItem.category}
              onChangeText={(text) => setNewItem({ ...newItem, category: text })}
            />

            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, newItem.isVegetarian && styles.checkboxSelected]}
                onPress={() => setNewItem({...newItem, isVegetarian: !newItem.isVegetarian})}
              >
                <MaterialIcons 
                  name={newItem.isVegetarian ? "check-box" : "check-box-outline-blank"} 
                  size={24} 
                  color={newItem.isVegetarian ? "#FFA500" : "#888"} 
                />
                <Text style={styles.checkboxLabel}>Vegetariano</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.checkbox, newItem.hasGluten && styles.checkboxSelected]}
                onPress={() => setNewItem({...newItem, hasGluten: !newItem.hasGluten})}
              >
                <MaterialIcons 
                  name={newItem.hasGluten ? "check-box" : "check-box-outline-blank"} 
                  size={24} 
                  color={newItem.hasGluten ? "#FFA500" : "#888"} 
                />
                <Text style={styles.checkboxLabel}>Contiene Gluten</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={24} color="white" />
              <Text style={{ color: 'white', marginLeft: 5 }}>Seleccionar Imagen</Text>
            </TouchableOpacity>
            {selectedImage && <Image source={{ uri: selectedImage.uri }} style={{ width: 100, height: 100, marginTop: 10 }} />}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#fff' }}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAddFood}>
                <Text style={{ color: '#fff' }}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  foodList: {
    padding: 20,
  },
  foodItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  foodImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  foodName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodPrice: {
    color: '#FFA500',
    fontSize: 14,
    marginTop: 5,
  },
  foodTags: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 8,
  },
  tag: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    color: '#999',
    fontSize: 12,
  },
  editButton: {
    padding: 10,
  },
  // Estilos del modal
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxSelected: {
    // Estilo adicional cuando está seleccionado
  },
  checkboxLabel: {
    color: 'white',
    marginLeft: 5,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 8,
  },
});