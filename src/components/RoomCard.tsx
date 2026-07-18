import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ruangan } from '../types';

interface RoomCardProps {
  ruangan: Ruangan;
  onClick: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ ruangan, onClick }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onClick} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title}>{ruangan.nama}</Text>
        <Text style={styles.subtitle}>{ruangan.kode} • Lantai {ruangan.lantai} (Kapasitas: {ruangan.kapasitas} orang)</Text>
        {ruangan.fasilitas && (
          <Text style={styles.facilities}>Fasilitas: {ruangan.fasilitas}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  facilities: {
    fontSize: 11,
    color: '#475569',
    marginTop: 8,
    fontStyle: 'italic',
  }
});
