import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ReportsScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reportes</Text>
        <Text style={styles.subtitle}>Análisis de tu negocio</Text>
      </View>

      <View style={styles.statsContainer}>
        {/* Aquí irán las estadísticas */}
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Visitas Totales</Text>
          <Text style={styles.statValue}>0</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Calificación Promedio</Text>
          <Text style={styles.statValue}>0.0</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total de Reseñas</Text>
          <Text style={styles.statValue}>0</Text>
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
  statsContainer: {
    padding: 20,
  },
  statCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  statTitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 