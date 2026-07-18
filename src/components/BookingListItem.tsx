import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Peminjaman } from '../types';
import { StatusTag } from './StatusTag';

interface BookingListItemProps {
  item: Peminjaman;
}

export const BookingListItem: React.FC<BookingListItemProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{item.ruang?.kode || '-'}</Text>
        </View>
        <StatusTag status={item.status} />
      </View>

      <Text style={styles.roomName}>{item.ruang?.nama || 'Ruangan'}</Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pemohon: </Text>
          <Text style={styles.detailValue}>{item.user?.name || 'Mahasiswa'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Keperluan: </Text>
          <Text style={styles.detailValue}>"{item.keperluan}"</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.timeInfo}>
          <Text style={styles.footerText}>📅 {item.tanggal}</Text>
          <Text style={styles.footerSpace}>   </Text>
          <Text style={styles.footerText}>🕒 {item.waktuMulai} WIB</Text>
        </View>
        <Text style={styles.idText}>ID: #{item.id}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  roomName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
  },
  details: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  detailValue: {
    fontSize: 12,
    color: '#475569',
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
  },
  footerSpace: {
    width: 8,
  },
  idText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#CBD5E1',
  },
});
