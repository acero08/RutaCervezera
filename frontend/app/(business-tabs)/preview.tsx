import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function PreviewScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vista Previa</Text>
        <Text style={styles.subtitle}>Así es como los clientes ven tu negocio</Text>
      </View>

      <View style={styles.previewContainer}>
        {/* Preview del Bar */}
        <View style={styles.barPreview}>
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="business" size={60} color="#FFA500" />
          </View>
          <Text style={styles.barName}>Nombre del Bar</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={20} color="#FFA500" />
            <Text style={styles.rating}>0.0</Text>
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="edit" size={24} color="#FFA500" />
            <Text style={styles.actionText}>Editar Información</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="photo-library" size={24} color="#FFA500" />
            <Text style={styles.actionText}>Gestionar Fotos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="menu-book" size={24} color="#FFA500" />
            <Text style={styles.actionText}>Editar Menú</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 5,
  },
  previewContainer: {
    padding: 20,
  },
  barPreview: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#2A2A2A',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  barName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: 'white',
    fontSize: 18,
    marginLeft: 5,
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
  },
}); 