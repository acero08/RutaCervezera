// frontend/app/menu/alcoholic-drinks.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Definir la interfaz para una bebida
interface Drink {
  id: string;
  name: string;
  price: number;
  image: string;
  alcoholPercentage: number;
  description: string;
  category: string;
  volume: number;
}

export default function AlcoholicDrinksScreen() {
  const [drinks, setDrinks] = useState<Drink[]>([]);

  const addNewDrink = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Aquí iría la lógica para subir la imagen y crear la bebida
      const newDrink: Drink = {
        id: Date.now().toString(),
        name: "Nueva Bebida",
        price: 0,
        image: result.assets[0].uri,
        alcoholPercentage: 0,
        description: "",
        category: "cerveza",
        volume: 0
      };
      setDrinks([...drinks, newDrink]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bebidas Alcohólicas</Text>
        <TouchableOpacity style={styles.addButton} onPress={addNewDrink}>
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Agregar Bebida</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.drinksList}>
        {drinks.map((drink) => (
          <View key={drink.id} style={styles.drinkItem}>
            <Image source={{ uri: drink.image }} style={styles.drinkImage} />
            <View style={styles.drinkInfo}>
              <Text style={styles.drinkName}>{drink.name}</Text>
              <Text style={styles.drinkPrice}>${drink.price.toFixed(2)}</Text>
              <Text style={styles.drinkDetails}>{drink.alcoholPercentage}% - {drink.volume}ml</Text>
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
  placeholderCover: {
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderProfile: {
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    height: 200,
    justifyContent: 'flex-end',
  },
  coverOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    width: '100%',
    justifyContent: 'center', // Centrar el contenido
  },
  uploadText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#121212',
  },
  profileImageOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FFA500',
    borderRadius: 15,
    padding: 8,
  },
});