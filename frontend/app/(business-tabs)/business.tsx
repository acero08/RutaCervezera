import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../../services/ApiService';

// Definir interfaces para los tipos
interface MenuSectionProps {
  title: string;
  icon: string;
  items?: number;
  onPress: () => void;
}

interface BarDetails {
  _id?: string;
  name: string;
  description?: string;
  coverImage: string | null;
  profileImage: string | null;
  phone?: string;
  email?: string;
  website?: string;
}

export default function BusinessScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const api = ApiService.getInstance();
  const [barDetails, setBarDetails] = useState<BarDetails>({ 
    name: '', 
    coverImage: null, 
    profileImage: null 
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({ profile: false, cover: false });
  const [nameLoading, setNameLoading] = useState(false);

  useEffect(() => {
    loadBarDetails();
  }, []);

  const loadBarDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading bar details...');
      const response = await api.getBarDetails();
      console.log('Bar details response:', response);
      
      if (response.success && response.data) {
        const barData = {
          _id: response.data._id,
          name: response.data.name || 'Mi Bar',
          description: response.data.description || '',
          coverImage: response.data.coverImage,
          profileImage: response.data.profileImage,
          phone: response.data.phone || '',
          email: response.data.email || '',
          website: response.data.website || ''
        };
        
        setBarDetails(barData);
        setNewName(barData.name);
        console.log('Bar details loaded:', barData);
      } else {
        console.error('Invalid response format:', response);
        Alert.alert('Error', 'Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error loading bar details:', error);
      Alert.alert(
        'Error', 
        'No se pudieron cargar los detalles del bar. Por favor, verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type: 'cover' | 'profile') => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería de fotos');
        return;
      }

      setImageLoading(prev => ({ ...prev, [type]: true }));

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'cover' ? [16, 9] : [1, 1],
        quality: 0.8, // Reducir calidad para archivos más pequeños
      });

      if (!result.canceled && result.assets[0]) {
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `${type}_image_${Date.now()}.jpg`
        } as any);

        console.log(`Uploading ${type} image...`);
        const response = await api.updateBarImage(type, formData);
        
        if (response.success) {
          // Update local state with the new image URL
          setBarDetails(prev => ({
            ...prev,
            [type === 'cover' ? 'coverImage' : 'profileImage']: response.data[type === 'cover' ? 'coverImage' : 'profileImage']
          }));
          
          Alert.alert('Éxito', `Imagen de ${type === 'cover' ? 'portada' : 'perfil'} actualizada correctamente`);
        } else {
          throw new Error(response.message || 'Error al subir la imagen');
        }
      }
    } catch (error) {
      console.error('Error updating image:', error);
      Alert.alert('Error', `No se pudo actualizar la imagen de ${type === 'cover' ? 'portada' : 'perfil'}`);
    } finally {
      setImageLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleNameEdit = async () => {
    if (!isEditingName) {
      setIsEditingName(true);
      return;
    }

    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      Alert.alert('Error', 'El nombre del bar no puede estar vacío');
      setNewName(barDetails.name); // Restaurar nombre original
      return;
    }

    if (trimmedName === barDetails.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setNameLoading(true);
      console.log('Updating bar name to:', trimmedName);
      
      const response = await api.updateBarDetails({ name: trimmedName });
      
      if (response.success) {
        setBarDetails(prev => ({ ...prev, name: trimmedName }));
        setIsEditingName(false);
        Alert.alert('Éxito', 'Nombre del bar actualizado correctamente');
      } else {
        throw new Error(response.message || 'Error al actualizar el nombre');
      }
    } catch (error) {
      console.error('Error updating bar name:', error);
      Alert.alert('Error', 'No se pudo actualizar el nombre del bar');
      setNewName(barDetails.name); // Restaurar nombre original
    } finally {
      setNameLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setNewName(barDetails.name);
    setIsEditingName(false);
  };

  const MenuSection: React.FC<MenuSectionProps> = ({ title, icon, items = 0, onPress }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={onPress}
    >
      <MaterialIcons name={icon as any} size={32} color="#FFA500" />
      <Text style={styles.menuItemText}>{title}</Text>
      <Text style={styles.itemCount}>{items} items</Text>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Cargando información del bar...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <TouchableOpacity onPress={() => pickImage('cover')} disabled={imageLoading.cover}>
        <ImageBackground
          source={barDetails.coverImage ? { uri: barDetails.coverImage } : require('../../assets/images/default-cover.jpg')}
          style={styles.coverImage}
        >
          <View style={styles.coverOverlay}>
            {imageLoading.cover ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="camera-alt" size={24} color="white" />
            )}
            <Text style={styles.uploadText}>
              {imageLoading.cover ? 'Subiendo...' : 'Cambiar imagen de portada'}
            </Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Profile Image */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => pickImage('profile')} disabled={imageLoading.profile}>
          <View style={styles.profileImageContainer}>
            <Image
              source={barDetails.profileImage ? { uri: barDetails.profileImage } : require('../../assets/images/placeholder.png')}
              style={styles.profileImage}
            />
            <View style={styles.profileImageOverlay}>
              {imageLoading.profile ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons name="camera-alt" size={20} color="white" />
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Editable Business Name */}
        <View style={styles.businessNameContainer}>
          {isEditingName ? (
            <View style={styles.editingContainer}>
              <TextInput
                style={styles.businessNameInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Nombre del bar"
                placeholderTextColor="#999"
                maxLength={50}
                returnKeyType="done"
                onSubmitEditing={handleNameEdit}
              />
              <View style={styles.editButtonsContainer}>
                <TouchableOpacity 
                  onPress={handleNameEdit}
                  style={[styles.editButton, styles.saveButton]}
                  disabled={nameLoading}
                >
                  {nameLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <MaterialIcons name="check" size={20} color="white" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleCancelEdit}
                  style={[styles.editButton, styles.cancelButton]}
                  disabled={nameLoading}
                >
                  <MaterialIcons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.businessNameWrapper}>
              <Text style={styles.businessName}>{barDetails.name}</Text>
              <MaterialIcons name="edit" size={20} color="#FFA500" style={styles.editIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Menu Management */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Gestión del Menú</Text>
        
        <MenuSection
          title="Bebidas Alcohólicas"
          icon="local-bar"
          items={0}
          onPress={() => router.push('/(menu)/alcoholic-drinks' as any)}
        />
        
        <MenuSection
          title="Bebidas"
          icon="local-cafe"
          items={0}
          onPress={() => router.push('/(menu)/drinks' as any)}
        />
        
        <MenuSection
          title="Alimentos"
          icon="restaurant"
          items={0}
          onPress={() => router.push('/(menu)/food' as any)}
        />
      </View>

      {/* Additional Management Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gestión General</Text>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="event" size={24} color="#FFA500" />
          <Text style={styles.actionText}>Gestionar Eventos</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="settings" size={24} color="#FFA500" />
          <Text style={styles.actionText}>Configuración del Bar</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
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
  },
  uploadText: {
    color: 'white',
    marginLeft: 8,
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
  businessNameContainer: {
    marginTop: 15,
    alignItems: 'center',
    minHeight: 50,
  },
  businessNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  editingContainer: {
    alignItems: 'center',
  },
  businessNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
    paddingBottom: 5,
    paddingHorizontal: 10,
    minWidth: 200,
    marginBottom: 10,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  editIcon: {
    marginLeft: 8,
  },
  menuContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
  },
  itemCount: {
    color: '#999',
    marginRight: 10,
  },
  section: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
});