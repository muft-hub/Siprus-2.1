import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Peminjaman } from '../types';
import { StatusTag } from './StatusTag';
import { generateSuratIzinPDF } from '../components/pdfGenerator';

interface BookingListItemProps {
  item: Peminjaman;
  isRiwayat?: boolean; 
}

export const BookingListItem: React.FC<BookingListItemProps> = ({ item, isRiwayat = false }) => {
  // Mencegah error TypeScript secara paksa dengan mengecek beberapa kemungkinan nama properti
  const namaRuangan = (item.ruang as any)?.nama || (item.ruang as any)?.namaRuangan || (item as any).namaRuangan || 'Fasilitas / Ruangan';
  const detailKegiatan = (item as any).kegiatan || (item as any).keperluan || (item as any).tujuan || (item as any).agenda || (item as any).keterangan || 'Detail Kegiatan';

  return (
    <View style={styles.card}>
      
      {/* 1. BAGIAN HEADER (TAMPIL KEMBALI) */}
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>RESERVASI</Text>
        </View>
        <StatusTag status={item.status} />
      </View>

      {/* 2. BAGIAN NAMA RUANGAN (SUDAH DIPERBAIKI) */}
      <Text style={styles.roomName}>{namaRuangan}</Text>

      {/* 3. BAGIAN DETAIL KEGIATAN (KETERANGAN YANG HILANG SUDAH TAMPIL) */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Kegiatan: </Text>
          <Text style={styles.detailValue}>{detailKegiatan}</Text> 
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

      {/* 4. TOMBOL CETAK (HANYA DI RIWAYAT & JIKA DISETUJUI) */}
      {isRiwayat && item.status === 'DISETUJUI' && (
        <TouchableOpacity 
          style={styles.printBtn} 
          onPress={() => generateSuratIzinPDF(item)}
        >
          <Text style={styles.printBtnText}>📄 Cetak Surat Izin</Text>
        </TouchableOpacity>
      )}
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
  printBtn: {
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  printBtnText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 12,
  },
});