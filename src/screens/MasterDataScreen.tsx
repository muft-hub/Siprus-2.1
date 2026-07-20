import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, SafeAreaView 
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import Icon from '../components/AppIcon';
import { apiService } from '../api/apiService';

export const MasterDataScreen: React.FC = () => {
  const { gedungList, ruanganList, isLoading, refreshData } = useApp();
  
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Gedung, 1: Ruangan
  
  // Add Gedung Form State
  const [addGedungVisible, setAddGedungVisible] = useState(false);
  const [gedungKode, setGedungKode] = useState("");
  const [gedungNama, setGedungNama] = useState("");
  const [gedungLokasi, setGedungLokasi] = useState("");
  const [isSubmittingGedung, setIsSubmittingGedung] = useState(false);

  // Add Ruangan Form State
  const [addRuanganVisible, setAddRuanganVisible] = useState(false);
  const [ruangKode, setRuangKode] = useState("");
  const [ruangNama, setRuangNama] = useState("");
  const [ruangGedungId, setRuangGedungId] = useState<number | null>(null);
  const [ruangLantai, setRuangLantai] = useState("");
  const [ruangKapasitas, setRuangKapasitas] = useState("");
  const [ruangJenis, setRuangJenis] = useState("");
  const [ruangFasilitas, setRuangFasilitas] = useState("");
  const [isSubmittingRuangan, setIsSubmittingRuangan] = useState(false);

  const handleAddGedung = async () => {
    if (!gedungKode.trim() || !gedungNama.trim()) {
      Alert.alert('Perhatian', 'Kode Gedung dan Nama Gedung tidak boleh kosong.');
      return;
    }

    setIsSubmittingGedung(true);
    try {
      const response = await apiService.addGedung({
        kode: gedungKode,
        nama: gedungNama,
        lokasi: gedungLokasi
      });
      Alert.alert('Sukses', response.message || 'Gedung berhasil ditambahkan.');
      setAddGedungVisible(false);
      setGedungKode("");
      setGedungNama("");
      setGedungLokasi("");
      await refreshData();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Gagal menambahkan gedung.');
    } finally {
      setIsSubmittingGedung(false);
    }
  };

  const handleAddRuangan = async () => {
    if (!ruangKode.trim() || !ruangNama.trim() || !ruangGedungId || !ruangLantai.trim() || !ruangKapasitas.trim()) {
      Alert.alert('Perhatian', 'Harap lengkapi semua field yang wajib diisi.');
      return;
    }

    setIsSubmittingRuangan(true);
    try {
      const response = await apiService.addRuangan({
        kode: ruangKode,
        nama: ruangNama,
        gedungId: ruangGedungId,
        lantai: parseInt(ruangLantai, 10),
        kapasitas: parseInt(ruangKapasitas, 10),
        jenis: ruangJenis || "Ruang Kelas",
        fasilitas: ruangFasilitas
      });
      Alert.alert('Sukses', response.message || 'Ruangan berhasil ditambahkan.');
      setAddRuanganVisible(false);
      setRuangKode("");
      setRuangNama("");
      setRuangGedungId(null);
      setRuangLantai("");
      setRuangKapasitas("");
      setRuangJenis("");
      setRuangFasilitas("");
      await refreshData();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Gagal menambahkan ruangan.');
    } finally {
      setIsSubmittingRuangan(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Kelola Data</Text>
        <Text style={styles.subtitle}>Administrasi prasarana UNIMUS.</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 0 && styles.tabActive]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>Gedung</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 1 && styles.tabActive]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>Ruangan</Text>
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addBtn}
        onPress={() => activeTab === 0 ? setAddGedungVisible(true) : setAddRuanganVisible(true)}
      >
        <Icon name="plus-circle-outline" size={16} color="#FFFFFF" />
        <Text style={[styles.addBtnText, { marginLeft: 8 }]}>Tambah {activeTab === 0 ? "Gedung" : "Ruangan"}</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={['#4F46E5']} />
        }
      >
        <Text style={styles.sectionHeader}>
          DAFTAR {activeTab === 0 ? "GEDUNG" : "RUANGAN"} ({activeTab === 0 ? gedungList.length : ruanganList.length})
        </Text>

        {activeTab === 0 ? (
          gedungList.map(g => (
            <View key={g.id} style={styles.dataCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{g.nama}</Text>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{g.kode}</Text>
                </View>
              </View>
              <Text style={styles.cardDesc}><Icon name="map-marker-outline" size={14} color="#64748B" />{'  '}Lokasi: {g.lokasi || '-'}</Text>
            </View>
          ))
        ) : (
          ruanganList.map(r => {
            const gName = gedungList.find(it => it.id === r.gedungId)?.nama || "Gedung";
            return (
              <View key={r.id} style={styles.dataCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{r.nama}</Text>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeBadgeText}>{r.kode}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}><Icon name="office-building" size={14} color="#64748B" />{'  '}{gName} • Lantai {r.lantai}</Text>
                <Text style={styles.cardDesc}><Icon name="account-group-outline" size={14} color="#64748B" />{'  '}Kapasitas: {r.kapasitas} orang • Jenis: {r.jenis}</Text>
                {r.fasilitas && <Text style={[styles.cardDesc, { fontStyle: 'italic' }]}><Icon name="television" size={14} color="#64748B" />{'  '}Fasilitas: {r.fasilitas}</Text>}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Gedung Modal */}
      <Modal visible={addGedungVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Gedung</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Kode Gedung (Wajib):</Text>
              <TextInput style={styles.formInput} value={gedungKode} onChangeText={setGedungKode} placeholder="Contoh: GD-A" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nama Gedung (Wajib):</Text>
              <TextInput style={styles.formInput} value={gedungNama} onChangeText={setGedungNama} placeholder="Contoh: Gedung Rektorat" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Lokasi / Alamat:</Text>
              <TextInput style={styles.formInput} value={gedungLokasi} onChangeText={setGedungLokasi} placeholder="Contoh: Kampus 1, Kedungmundu" />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setAddGedungVisible(false)}>
                <Text style={styles.cancelModalText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitModalBtn} onPress={handleAddGedung} disabled={isSubmittingGedung}>
                {isSubmittingGedung ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitModalText}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Ruangan Modal */}
      <Modal visible={addRuanganVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Ruangan</Text>
            <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kode Ruangan (Wajib):</Text>
                <TextInput style={styles.formInput} value={ruangKode} onChangeText={setRuangKode} placeholder="Contoh: R-301" />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nama Ruangan (Wajib):</Text>
                <TextInput style={styles.formInput} value={ruangNama} onChangeText={setRuangNama} placeholder="Contoh: Ruang Seminar 3" />
              </View>

              <Text style={styles.formLabel}>Pilih Gedung (Wajib):</Text>
              <View style={styles.spinnerContainer}>
                {gedungList.map(g => (
                  <TouchableOpacity 
                    key={g.id} 
                    style={[styles.gSelect, ruangGedungId === g.id && styles.gSelectActive]}
                    onPress={() => setRuangGedungId(g.id)}
                  >
                    <Text style={[styles.gSelectText, ruangGedungId === g.id && styles.gSelectTextActive]}>{g.nama}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Lantai:</Text>
                  <TextInput style={styles.formInput} keyboardType="numeric" value={ruangLantai} onChangeText={setRuangLantai} placeholder="Contoh: 3" />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Kapasitas:</Text>
                  <TextInput style={styles.formInput} keyboardType="numeric" value={ruangKapasitas} onChangeText={setRuangKapasitas} placeholder="Contoh: 40" />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Jenis Ruangan:</Text>
                <TextInput style={styles.formInput} value={ruangJenis} onChangeText={setRuangJenis} placeholder="Contoh: Ruang Kelas, Lab, Teater" />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Fasilitas:</Text>
                <TextInput style={styles.formInput} value={ruangFasilitas} onChangeText={setRuangFasilitas} placeholder="Contoh: AC, Proyektor, Speaker" />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setAddRuanganVisible(false)}>
                <Text style={styles.cancelModalText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitModalBtn} onPress={handleAddRuangan} disabled={isSubmittingRuangan}>
                {isSubmittingRuangan ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitModalText}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#F1F5F9',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#4F46E5',
    margin: 16,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  codeBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginVertical: 2,
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
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
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
    marginTop: 20,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelModalText: {
    color: '#475569',
    fontWeight: 'bold',
  },
  submitModalBtn: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitModalText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  spinnerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 6,
  },
  gSelect: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  gSelectActive: {
    backgroundColor: '#4F46E5',
  },
  gSelectText: {
    fontSize: 11,
    color: '#475569',
  },
  gSelectTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
