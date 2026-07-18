import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  TouchableOpacity, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import { BookingListItem } from '../components/BookingListItem';
import { PeminjamanStatus } from '../types';

export const HistoryScreen: React.FC = () => {
  const { peminjamanList, isLoading, refreshData } = useApp();
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('Semua');

  const filteredHistory = peminjamanList.filter(item => {
    if (selectedStatusTab === 'Semua') return true;
    if (selectedStatusTab === 'Disetujui') return item.status === PeminjamanStatus.DISETUJUI;
    if (selectedStatusTab === 'Pending') return item.status === PeminjamanStatus.MENUNGGU_RT || item.status === PeminjamanStatus.MENUNGGU_KEPALA;
    if (selectedStatusTab === 'Ditolak') return item.status === PeminjamanStatus.DITOLAK_RT || item.status === PeminjamanStatus.DITOLAK_KEPALA;
    if (selectedStatusTab === 'Revisi') return item.status === PeminjamanStatus.BUTUH_REVISI;
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat Reservasi</Text>
        <Text style={styles.subtitle}>Daftar pengajuan peminjaman ruangan Anda.</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {['Semua', 'Disetujui', 'Pending', 'Ditolak', 'Revisi'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, selectedStatusTab === tab && styles.tabBtnActive]}
              onPress={() => setSelectedStatusTab(tab)}
            >
              <Text style={[styles.tabText, selectedStatusTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={['#4F46E5']} />
        }
      >
        {isLoading ? (
          <ActivityIndicator color="#4F46E5" style={{ marginTop: 40 }} />
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>Tidak ada data pengajuan dalam kategori ini.</Text>
          </View>
        ) : (
          filteredHistory.map(item => (
            <BookingListItem key={item.id} item={item} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  tabScroll: {
    paddingHorizontal: 12,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  tabBtnActive: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
});
