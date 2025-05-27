import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define interfaces for type safety
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  capacity?: number;
  price?: number;
}

interface FormData {
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: string;
  price: string;
}

export default function HostingScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: new Date(),
    location: '',
    capacity: '',
    price: '',
  });

  useEffect(() => {
    if (!user || user.accountType !== 'business' || !user.managedBars?.[0]) {
      Alert.alert('Error', 'No tienes acceso a esta sección o no tienes bares asignados');
      router.replace('/');
      return;
    }

    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    if (!user?.managedBars?.[0] || !token) {
      Alert.alert('Error', 'No tienes bares asignados o no estás autenticado');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/bars/${user.managedBars[0]}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!user?.managedBars?.[0] || !token) {
      Alert.alert('Error', 'No tienes bares asignados o no estás autenticado');
      return;
    }

    try {
      if (!formData.title || !formData.description || !formData.date) {
        Alert.alert('Error', 'Por favor completa los campos requeridos');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/bars/${user.managedBars[0]}/new-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Éxito', 'Evento creado correctamente');
        setShowModal(false);
        // Reset form data
        setFormData({
          title: '',
          description: '',
          date: new Date(),
          location: '',
          capacity: '',
          price: '',
        });
        loadEvents();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error creando evento:', error);
      Alert.alert('Error', 'No se pudo crear el evento');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user?.managedBars?.[0] || !token) {
      Alert.alert('Error', 'No tienes bares asignados o no estás autenticado');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/bars/${user.managedBars[0]}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Éxito', 'Evento eliminado correctamente');
        loadEvents();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error eliminando evento:', error);
      Alert.alert('Error', 'No se pudo eliminar el evento');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E4AB1C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Eventos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Nuevo Evento</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.eventsList}>
        {events.map((event) => (
          <View key={event._id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteEvent(event._id)}
                style={styles.deleteButton}
              >
                <MaterialIcons name="delete" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            <Text style={styles.eventDate}>
              {new Date(event.date).toLocaleDateString()}
            </Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Evento</Text>

            <TextInput
              style={styles.input}
              placeholder="Título del evento"
              placeholderTextColor="#666"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {/* Mostrar DateTimePicker */}}
            >
              <Text style={styles.dateButtonText}>
                Seleccionar Fecha: {formData.date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Ubicación"
              placeholderTextColor="#666"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Capacidad"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.capacity}
              onChangeText={(text) => setFormData({ ...formData, capacity: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Precio"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateEvent}
              >
                <Text style={styles.buttonText}>Crear Evento</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#171615',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4AB1C',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  eventDate: {
    fontSize: 14,
    color: '#E4AB1C',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#CCC',
  },
  deleteButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#FFF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  createButton: {
    backgroundColor: '#E4AB1C',
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});