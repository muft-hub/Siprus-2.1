import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ruangan } from '../types';

interface RoomCardProps {
  ruangan: Ruangan;
  onClick: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ ruangan, onClick }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onClick} 
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Text style={styles.roomName}>{ruangan.nama}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{ruangan.jenis}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.infoText}>Kode: {ruangan.kode} • Lantai: {ruangan.lantai}</Text>
          <Text style={styles.capacity}>👥 {ruangan.kapasitas}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // Radius sedikit lebih kecil agar terlihat ringkas
    padding: 12,      // Padding dikurangi dari 16 ke 12
    marginBottom: 8,  // Jarak antar kartu dikurangi
    borderWidth: 1,
    borderColor: '#F1F5F9', // Border lebih terang agar tidak terlalu menonjol
    // Shadow diperhalus agar terlihat "tipis" dan tidak tebal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, 
    shadowRadius: 3,
    elevation: 1, // Elevation kecil agar tidak terlalu menonjol
  },
  cardContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomName: {
    fontSize: 16, // Font size sedikit dikurangi
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2, // Badge lebih tipis
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9, // Font lebih kecil
    fontWeight: 'bold',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
  },
  capacity: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});