import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, SafeAreaView 
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import { BookingListItem } from '../components/BookingListItem';
import { PeminjamanStatus, Role, Peminjaman } from '../types';

export const ValidationScreen: React.FC = () => {
  const { currentUser, peminjamanList, validateBooking, switchRoom, ruanganList, isLoading, refreshData } = useApp();
  
  const [selectedTab, setSelectedTab] = useState<number>(0); // 0: Antrean, 1: Semua Riwayat
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [activeItem, setActiveItem] = useState<Peminjaman | null>(null);
  const [noteAction, setNoteAction] = useState<"REJECT" | "REVISE" | null>(null);
  const [noteText, setNoteText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Switch Room State
  const [switchModalVisible, setSwitchModalVisible] = useState(false);
  const [selectedNewRoomId, setSelectedNewRoomId] = useState<number | null>(null);
  const [switchAlasan, setSwitchAlasan] = useState("");

  const userRole = currentUser?.role || Role.GUEST;

  const needsValidationList = peminjamanList.filter(p => {
    if (userRole === Role.ADMIN_RT) return p.status === PeminjamanStatus.MENUNGGU_RT;
    if (userRole === Role.KEPALA_RT) return p.status === PeminjamanStatus.MENUNGGU_KEPALA;
    return false;
  });

  const displayList = selectedTab === 0 ? needsValidationList : peminjamanList;

  const handleApprove = async (item: Peminjaman) => {
    setActionLoading(true);
    // If ADMIN_RT approve, it moves to MENUNGGU_KEPALA. If KEPALA_RT, it is DISETUJUI.
    const action = "APPROVE";
    const response = await validateBooking(item.id, action, "Disetujui oleh admin.");
    setActionLoading(false);
    if (response.success) {
      Alert.alert('Sukses', 'Reservasi berhasil disetujui/diteruskan!');
    } else {
      Alert.alert('Gagal', response.message);
    }
  };

  const handleOpenNoteModal = (item: Peminjaman, action: "REJECT" | "REVISE") => {
    setActiveItem(item);
    setNoteAction(action);
    setNoteText("");
    setNoteModalVisible(true);
  };

  const handleSendNoteAction = async () => {
    if (!activeItem || !noteAction) return;
    if (!noteText.trim()) {
      Alert.alert('Perhatian', 'Harap isi alasan catatan.');
      return;
    }

    setActionLoading(true);
    const response = await validateBooking(activeItem.id, noteAction, noteText);
    setActionLoading(false);
    setNoteModalVisible(false);

    if (response.success) {
      Alert.alert('Sukses', `Verifikasi ${noteAction === "REJECT" ? 'Penolakan' : 'Revisi'} berhasil disimpan.`);
      setActiveItem(null);
    } else {
      Alert.alert('Gagal', response.message);
    }
  };

  const handleOpenSwitchModal = (item: Peminjaman) => {
    setActiveItem(item);
    setSelectedNewRoomId(null);
    setSwitchAlasan("");
    setSwitchModalVisible(true);
  };

  const handleExecuteSwitch = async () => {
    if (!activeItem || !selectedNewRoomId) {
      Alert.alert('Perhatian', 'Harap pilih ruangan baru.');
      return;
    }
    if (!switchAlasan.trim()) {
      Alert.alert('Perhatian', 'Harap isi alasan pengalihan ruangan.');
      return;
    }

    setActionLoading(true);
    const response = await switchRoom(activeItem.id, selectedNewRoomId, switchAlasan);
    setActionLoading(false);
    setSwitchModalVisible(false);

    if (response.success) {
      Alert.alert('Sukses', 'Ruangan berhasil dialihkan!');
      setActiveItem(null);
    } else {
      Alert.alert('Gagal', response.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel Validasi</Text>
        <Text style={styles.subtitle}>
          {userRole === Role.ADMIN_RT ? "Tingkat 1 (Rumah Tangga)" : "Tingkat 2 (Kepala Siprus)"}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 0 && styles.tabActive]}
          onPress={() => setSelectedTab(0)}
        >
          <Text style={[styles.tabText, selectedTab === 0 && styles.tabTextActive]}>
            Antrean ({needsValidationList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 1 && styles.tabActive]}
          onPress={() => setSelectedTab(1)}
        >
          <Text style={[styles.tabText, selectedTab === 1 && styles.tabTextActive]}>
            Semua Riwayat
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={['#4F46E5']} />
        }
      >
        {displayList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyText}>Tidak ada data antrean validasi.</Text>
          </View>
        ) : (
          displayList.map(item => (
            <View key={item.id} style={styles.itemWrapper}>
              <BookingListItem item={item} />
              
              {selectedTab === 0 && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApprove(item)}>
                    <Text style={styles.actionBtnTextText}>Setujui</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtn, styles.revisionBtn]} onPress={() => handleOpenNoteModal(item, "REVISE")}>
                    <Text style={styles.actionBtnTextText}>Revisi</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleOpenNoteModal(item, "REJECT")}>
                    <Text style={styles.actionBtnTextText}>Tolak</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtn, styles.switchBtn]} onPress={() => handleOpenSwitchModal(item)}>
                    <Text style={styles.actionBtnTextText}>Alihkan</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Rejection / Revision Note Modal */}
      <Modal visible={noteModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambahkan Catatan</Text>
            <Text style={styles.modalSubtitle}>
              Berikan penjelasan untuk status {noteAction === "REJECT" ? "Tolak" : "Revisi"}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Tulis alasan atau catatan instruksi..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setNoteModalVisible(false)}>
                <Text style={styles.cancelModalText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitModalBtn} onPress={handleSendNoteAction} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitModalText}>Kirim</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Switch Room Modal */}
      <Modal visible={switchModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alihkan Ruangan</Text>
            <Text style={styles.modalSubtitle}>Pindahkan reservasi ini ke ruangan alternatif</Text>

            <Text style={styles.selectLabel}>Pilih Ruangan Baru:</Text>
            <ScrollView style={styles.roomSelectContainer}>
              {ruanganList.map(room => (
                <TouchableOpacity 
                  key={room.id}
                  style={[styles.roomSelectItem, selectedNewRoomId === room.id && styles.roomSelectItemActive]}
                  onPress={() => setSelectedNewRoomId(room.id)}
                >
                  <Text style={[styles.roomSelectText, selectedNewRoomId === room.id && styles.roomSelectTextActive]}>
                    {room.nama} ({room.kode})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.modalInput, { marginTop: 12 }]}
              placeholder="Tulis alasan pengalihan ruangan..."
              value={switchAlasan}
              onChangeText={setSwitchAlasan}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setSwitchModalVisible(false)}>
                <Text style={styles.cancelModalText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitModalBtn} onPress={handleExecuteSwitch} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitModalText}>Kirim</Text>}
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
  },
  itemWrapper: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'space-around',
    backgroundColor: '#FAFAFA',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  revisionBtn: {
    backgroundColor: '#7C3AED',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  switchBtn: {
    backgroundColor: '#3B82F6',
  },
  actionBtnTextText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    height: 80,
    textAlignVertical: 'top',
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
  selectLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8,
  },
  roomSelectContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 8,
  },
  roomSelectItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  roomSelectItemActive: {
    backgroundColor: '#EEF2FF',
  },
  roomSelectText: {
    fontSize: 13,
    color: '#475569',
  },
  roomSelectTextActive: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
});
