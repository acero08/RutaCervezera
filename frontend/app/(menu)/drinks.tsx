import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';

interface DrinkItem {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAlcoholic: boolean;
  volume: number;
  category: string;
  servingTemperature?: string;
}

export default function DrinksScreen() {
  const [drinks, setDrinks] = useState<DrinkItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ uri: string } | null>(null);
  const [newItem, setNewItem] = useState<DrinkItem>({
    name: '',
    description: '',
    price: 0,
    isAlcoholic: false,
    volume: 0,
    category: 'refresco',
    servingTemperature: 'frio'
  });
  const { token } = useAuth();
  const api = ApiService.getInstance();

  useEffect(() => {
    loadDrinks();
  }, []);

  const loadDrinks = async () => {
    try {
      const response = await api.getBarMenu();
      if (response.success) {
        setDrinks(response.data.filter((item: DrinkItem) => !item.isAlcoholic));
      }
    } catch (error) {
      console.error('Error loading drinks:', error);
      Alert.alert('Error', 'No se pudieron cargar las bebidas');
    }
  };

  const handleAddDrink = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('description', newItem.description);
      formData.append('price', newItem.price.toString());
      formData.append('isAlcoholic', 'false');
      formData.append('volume', newItem.volume.toString());
      formData.append('category', newItem.category);
      formData.append('servingTemperature', newItem.servingTemperature || 'frio');

      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'drink_image.jpg'
        } as any);
      }

      const response = await api.createDrinkItem(formData);
      
      if (response.success) {
        Alert.alert('Éxito', 'Bebida creada correctamente');
        setModalVisible(false);
        loadDrinks(); // Recargar la lista
        // Limpiar el formulario
        setNewItem({
          name: '',
          description: '',
          price: 0,
          isAlcoholic: false,
          volume: 0,
          category: 'refresco',
          servingTemperature: 'frio'
        });
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error al crear bebida:', error);
      Alert.alert('Error', 'No se pudo crear la bebida');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bebidas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Agregar Bebida</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.drinksList}>
        {drinks.map((drink) => (
          <View key={drink._id} style={styles.drinkItem}>
            {drink.image ? (
              <Image source={{ uri: drink.image }} style={styles.drinkImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="local-cafe" size={40} color="#FFA500" />
              </View>
            )}
            <View style={styles.drinkInfo}>
              <Text style={styles.drinkName}>{drink.name}</Text>
              <Text style={styles.drinkPrice}>${drink.price.toFixed(2)}</Text>
              <Text style={styles.drinkDetails}>
                {drink.volume}ml - {drink.servingTemperature}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={24} color="#FFA500" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
  drinksList: {
    padding: 20,
  },
  drinkItem: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  drinkImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drinkInfo: {
    flex: 1,
    marginLeft: 15,
  },
  drinkName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drinkPrice: {
    color: '#FFA500',
    fontSize: 14,
    marginTop: 5,
  },
  drinkDetails: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  editButton: {
    padding: 10,
  },
}); 