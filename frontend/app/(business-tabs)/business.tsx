import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Definir interfaces para los tipos
interface MenuSectionProps {
  title: string;
  icon: string;
  items?: number;
  onPress: () => void;
}

export default function BusinessScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async (type: 'cover' | 'profile') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'cover' ? [16, 9] : [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'cover') {
        setCoverImage(result.assets[0].uri);
      } else {
        setProfileImage(result.assets[0].uri);
      }
    }
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

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <TouchableOpacity onPress={() => pickImage('cover')}>
        <ImageBackground
          source={coverImage ? { uri: coverImage } : require('../../assets/images/default-cover.jpg')}
          style={styles.coverImage}
        >
          <View style={styles.coverOverlay}>
            <MaterialIcons name="camera-alt" size={24} color="white" />
            <Text style={styles.uploadText}>Cambiar imagen de portada</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Profile Image */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => pickImage('profile')}>
          <View style={styles.profileImageContainer}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../assets/images/placeholder.png')}
              style={styles.profileImage}
            />
            <View style={styles.profileImageOverlay}>
              <MaterialIcons name="camera-alt" size={20} color="white" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.businessName}>{user?.name || 'Mi Negocio'}</Text>
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
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
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