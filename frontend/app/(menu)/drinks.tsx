import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Alert, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation();

  useEffect(() => {
    loadDrinks();
  }, []);

  const loadDrinks = async () => {
    try {
      const response = await api.getBarMenu();
      if (response.success) {
        setDrinks(response.data.drinks || []);
      }
    } catch (error) {
      console.error('Error loading drinks:', error);
      Alert.alert('Error', 'No se pudieron cargar las bebidas');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage({ uri: result.assets[0].uri });
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
      formData.append('itemType', 'drink');

      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'drink_image.jpg',
        } as any);
      }

      const response = await api.createDrinkItem(formData);

      if (response.success) {
        Alert.alert('Éxito', 'Bebida creada correctamente');
        setModalVisible(false);
        loadDrinks();
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
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
          </View>
        ))}
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nueva Bebida</Text>

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
              placeholder="Volumen en ml (ej. 355)"
              placeholderTextColor="#888"
              style={styles.input}
              keyboardType="decimal-pad"
              value={newItem.volume ? newItem.volume.toString() : ''}
              onChangeText={(text) => setNewItem({ ...newItem, volume: parseFloat(text) || 0 })}
            />

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={24} color="white" />
              <Text style={{ color: 'white', marginLeft: 5 }}>Seleccionar Imagen</Text>
            </TouchableOpacity>
            {selectedImage && <Image source={{ uri: selectedImage.uri }} style={{ width: 100, height: 100, marginTop: 10 }} />}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#fff' }}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAddDrink}>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 8,
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
