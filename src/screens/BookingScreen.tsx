import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Modal, Button, Alert, ActivityIndicator, SafeAreaView, Switch 
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import { RoomCard } from '../components/RoomCard';
import { Role, Ruangan } from '../types';

interface BookingScreenProps {
  onNavigateToHistory: () => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({ onNavigateToHistory }) => {
  const { currentUser, gedungList, ruanganList, createBooking, isLoading, refreshData } = useApp();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGedungId, setSelectedGedungId] = useState<number | null>(null);
  const [selectedLantai, setSelectedLantai] = useState<string>('Semua');
  const [selectedTipe, setSelectedTipe] = useState<string>('Semua');
  const [minKapasitas, setMinKapasitas] = useState<number>(1);

  // Booking states
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Ruangan | null>(null);
  const [tanggal, setTanggal] = useState('2026-07-20');
  const [waktuMulai, setWaktuMulai] = useState('08:00');
  const [waktuSelesai, setWaktuSelesai] = useState('10:00');
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = currentUser?.role || Role.GUEST;
  const isGuest = userRole === Role.GUEST;

  const filteredRuangan = ruanganList.filter(room => {
    const matchGedung = selectedGedungId === null || room.gedungId === selectedGedungId;
    const matchLantai = selectedLantai === 'Semua' || room.lantai.toString() === selectedLantai;
    const matchKeyword = !searchKeyword || 
      room.nama.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      room.kode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      room.jenis.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchTipe = selectedTipe === 'Semua' || room.jenis.toLowerCase().includes(selectedTipe.toLowerCase());
    const matchKapasitas = room.kapasitas >= minKapasitas;
    return matchGedung && matchLantai && matchKeyword && matchTipe && matchKapasitas;
  });

  const handleCreateBooking = async () => {
    if (!selectedRoomForBooking) return;
    if (!keperluan.trim()) {
      Alert.alert('Perhatian', 'Harap isi keperluan penggunaan ruangan.');
      return;
    }

    setIsSubmitting(true);
    const response = await createBooking(
      selectedRoomForBooking.id,
      tanggal,
      waktuMulai,
      waktuSelesai,
      keperluan
    );
    setIsSubmitting(false);

    if (response.success) {
      Alert.alert('Sukses', response.message);
      setSelectedRoomForBooking(null);
      setKeperluan('');
      onNavigateToHistory();
    } else {
      Alert.alert('Gagal', response.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Pencarian Ruangan</Text>
        <Text style={styles.subtitle}>
          {isGuest ? 'Lihat daftar ruangan UNIMUS.' : 'Temukan dan reservasi ruangan UNIMUS.'}
        </Text>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Cari nama/kode/tipe ruangan..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />

          <Text style={styles.filterLabel}>Gedung:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
            <TouchableOpacity 
              style={[styles.chip, selectedGedungId === null && styles.activeChip]}
              onPress={() => setSelectedGedungId(null)}
            >
              <Text style={[styles.chipText, selectedGedungId === null && styles.activeChipText]}>Semua</Text>
            </TouchableOpacity>
            {gedungList.map(gedung => (
              <TouchableOpacity 
                key={gedung.id}
                style={[styles.chip, selectedGedungId === gedung.id && styles.activeChip]}
                onPress={() => setSelectedGedungId(gedung.id)}
              >
                <Text style={[styles.chipText, selectedGedungId === gedung.id && styles.activeChipText]}>{gedung.nama}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Lantai:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
            {['Semua', '1', '2', '3', '4', '5'].map(lt => (
              <TouchableOpacity 
                key={lt}
                style={[styles.chip, selectedLantai === lt && styles.activeChip]}
                onPress={() => setSelectedLantai(lt)}
              >
                <Text style={[styles.chipText, selectedLantai === lt && styles.activeChipText]}>
                  {lt === 'Semua' ? 'Semua' : `Lantai ${lt}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Room list */}
        <Text style={styles.listHeader}>Hasil Pencarian ({filteredRuangan.length})</Text>

        {isLoading ? (
          <ActivityIndicator color="#4F46E5" style={{ margin: 24 }} />
        ) : filteredRuangan.length === 0 ? (
          <Text style={styles.noResults}>Tidak ada ruangan yang cocok dengan filter.</Text>
        ) : (
          filteredRuangan.map(room => (
            <RoomCard
              key={room.id}
              ruangan={room}
              onClick={() => {
                if (isGuest) {
                  Alert.alert('Perhatian', 'Sesi Guest hanya diizinkan untuk melihat ruangan. Silakan login mahasiswa untuk melakukan reservasi.');
                } else if (userRole !== Role.MAHASISWA) {
                  Alert.alert('Perhatian', 'Hanya mahasiswa yang diperbolehkan membuat pengajuan reservasi ruangan.');
                } else {
                  setSelectedRoomForBooking(room);
                }
              }}
            />
          ))
        )}

        {/* Booking Form Modal */}
        <Modal
          visible={selectedRoomForBooking !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedRoomForBooking(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reservasi Ruangan</Text>
              <Text style={styles.modalRoomName}>{selectedRoomForBooking?.nama}</Text>
              <Text style={styles.modalRoomKode}>{selectedRoomForBooking?.kode}</Text>

              <ScrollView style={styles.modalForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tanggal Penggunaan (YYYY-MM-DD):</Text>
                  <TextInput
                    style={styles.formInput}
                    value={tanggal}
                    onChangeText={setTanggal}
                    placeholder="Contoh: 2026-07-20"
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Mulai (WIB):</Text>
                    <TextInput
                      style={styles.formInput}
                      value={waktuMulai}
                      onChangeText={setWaktuMulai}
                      placeholder="Contoh: 08:00"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Selesai (WIB):</Text>
                    <TextInput
                      style={styles.formInput}
                      value={waktuSelesai}
                      onChangeText={setWaktuSelesai}
                      placeholder="Contoh: 10:00"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Keperluan / Kegiatan:</Text>
                  <TextInput
                    style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                    value={keperluan}
                    onChangeText={setKeperluan}
                    placeholder="Contoh: Rapat Himpunan Mahasiswa"
                    multiline
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => setSelectedRoomForBooking(null)}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.submitBtn} 
                  onPress={handleCreateBooking}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Ajukan Reservasi</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    color: '#475569',
    marginTop: 4,
    marginBottom: 16,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
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
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 8,
    marginBottom: 6,
  },
  horizontalChips: {
    flexDirection: 'row',
    marginBottom: 8,
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
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  noResults: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  modalRoomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginTop: 8,
  },
  modalRoomKode: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  modalForm: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
