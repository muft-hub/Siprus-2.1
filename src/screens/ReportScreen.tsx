import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, Alert, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import { BookingListItem } from '../components/BookingListItem';

export const ReportScreen: React.FC = () => {
  const { peminjamanList, gedungList, isLoading } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [selectedGedungId, setSelectedGedungId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-31');

  const filteredList = peminjamanList.filter(item => {
    const matchSearch = !searchQuery || 
      (item.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ruang?.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keperluan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchGedung = selectedGedungId === null || item.ruang?.gedungId === selectedGedungId;

    const matchDate = (!startDate || item.tanggal >= startDate) && 
                      (!endDate || item.tanggal <= endDate);

    return matchSearch && matchGedung && matchDate;
  });

  const handleExport = (format: 'Excel' | 'PDF') => {
    Alert.alert('Ekspor Berhasil', `Laporan rekapitulasi ${format} berhasil diunduh ke folder Downloads.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Laporan Rekapitulasi</Text>
        <Text style={styles.subtitle}>Rekapitulasi penggunaan prasarana Universitas Muhammadiyah Semarang.</Text>

        {/* Quick Stats Summary Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsCardTitle}>📊 Ringkasan Laporan</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{peminjamanList.length}</Text>
              <Text style={styles.statLabel}>Total Reservasi</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{filteredList.length}</Text>
              <Text style={styles.statLabel}>Hasil Filter</Text>
            </View>
          </View>
        </View>

        {/* Export Buttons */}
        <View style={styles.exportRow}>
          <TouchableOpacity style={[styles.exportBtn, styles.excelBtn]} onPress={() => handleExport('Excel')}>
            <Text style={styles.exportBtnText}>🟢 Ekspor Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, styles.pdfBtn]} onPress={() => handleExport('PDF')}>
            <Text style={styles.exportBtnText}>🔴 Ekspor PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>🔍 Filter Laporan</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Cari pemohon, ruangan, keperluan..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.formRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Dari Tanggal:</Text>
              <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Sampai Tanggal:</Text>
              <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
            </View>
          </View>

          <Text style={styles.label}>Gedung:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
            <TouchableOpacity 
              style={[styles.chip, selectedGedungId === null && styles.activeChip]}
              onPress={() => setSelectedGedungId(null)}
            >
              <Text style={[styles.chipText, selectedGedungId === null && styles.activeChipText]}>Semua</Text>
            </TouchableOpacity>
            {gedungList.map(g => (
              <TouchableOpacity 
                key={g.id}
                style={[styles.chip, selectedGedungId === g.id && styles.activeChip]}
                onPress={() => setSelectedGedungId(g.id)}
              >
                <Text style={[styles.chipText, selectedGedungId === g.id && styles.activeChipText]}>{g.nama}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results */}
        <Text style={styles.resultsHeader}>Daftar Laporan ({filteredList.length})</Text>

        {isLoading ? (
          <ActivityIndicator color="#4F46E5" style={{ margin: 24 }} />
        ) : filteredList.length === 0 ? (
          <Text style={styles.noResults}>Tidak ada data laporan yang cocok.</Text>
        ) : (
          filteredList.map(item => (
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
  scroll: {
    padding: 16,
    paddingBottom: 40,
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
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  exportRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  exportBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  excelBtn: {
    backgroundColor: '#10B981',
  },
  pdfBtn: {
    backgroundColor: '#EF4444',
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
  },
  horizontalChips: {
    flexDirection: 'row',
    marginTop: 6,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#4F46E5',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  noResults: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 24,
  },
});
