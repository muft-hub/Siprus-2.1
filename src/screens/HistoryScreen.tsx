import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  TouchableOpacity, SafeAreaView, ActivityIndicator, Modal 
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import Icon from '../components/AppIcon';
import { BookingListItem } from '../components/BookingListItem';
import { PeminjamanStatus, Peminjaman } from '../types';

export const HistoryScreen: React.FC = () => {
  const { peminjamanList, isLoading, refreshData } = useApp();
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('Semua');
  const [selectedBooking, setSelectedBooking] = useState<Peminjaman | null>(null);

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTimelineSteps = (item: Peminjaman) => {
    const createdAt = formatDateTime(item.createdAt ?? item.tanggal);
    const updatedAt = formatDateTime(item.updatedAt ?? null);
    const status = item.status;
    const isRejected = status === PeminjamanStatus.DITOLAK_RT || status === PeminjamanStatus.DITOLAK_KEPALA;
    const isApproved = status === PeminjamanStatus.DISETUJUI;
    const isWaitingRt = status === PeminjamanStatus.MENUNGGU_RT;
    const isWaitingKepala = status === PeminjamanStatus.MENUNGGU_KEPALA;
    const isRevision = status === PeminjamanStatus.BUTUH_REVISI;

    return [
      {
        title: 'Pengajuan dibuat',
        description: item.createdAt ? `Diaju pada ${createdAt}` : `Tanggal ${createdAt}`,
        active: true,
        statusLabel: 'Selesai',
      },
      {
        title: 'Verifikasi RT',
        description: isWaitingRt
          ? 'Menunggu verifikasi RT'
          : isRejected && status === PeminjamanStatus.DITOLAK_RT
            ? `Ditolak RT${item.catatanRt ? `: ${item.catatanRt}` : ''}`
            : 'Sudah diverifikasi oleh RT',
        active: !isWaitingRt,
        statusLabel: isWaitingRt ? 'Menunggu' : isRejected && status === PeminjamanStatus.DITOLAK_RT ? 'Ditolak' : 'Selesai',
      },
      {
        title: 'Verifikasi Kepala',
        description: isWaitingKepala
          ? 'Menunggu verifikasi kepala'
          : isRejected && status === PeminjamanStatus.DITOLAK_KEPALA
            ? `Ditolak Kepala${item.catatanKepala ? `: ${item.catatanKepala}` : ''}`
            : status === PeminjamanStatus.DISETUJUI || status === PeminjamanStatus.BUTUH_REVISI
              ? 'Sudah diverifikasi oleh Kepala'
              : 'Belum diproses',
        active: status !== PeminjamanStatus.MENUNGGU_RT && status !== PeminjamanStatus.MENUNGGU_KEPALA,
        statusLabel: isWaitingKepala ? 'Menunggu' : isRejected && status === PeminjamanStatus.DITOLAK_KEPALA ? 'Ditolak' : status === PeminjamanStatus.DISETUJUI ? 'Selesai' : isRevision ? 'Revisi' : 'Belum',
      },
      {
        title: isRejected ? 'Pengajuan ditolak' : 'Disetujui',
        description: isRejected
          ? `Ditolak pada ${updatedAt}`
          : isApproved
            ? `Disetujui pada ${updatedAt}`
            : isRevision
              ? `Perlu revisi: ${item.catatanRevisi ?? 'Tidak ada catatan'}`
              : 'Belum selesai',
        active: isApproved || isRejected || isRevision,
        statusLabel: isRejected ? 'Ditolak' : isApproved ? 'Selesai' : isRevision ? 'Revisi' : 'Menunggu',
      }
    ];
  };

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
            <Icon name="folder-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>Tidak ada data pengajuan dalam kategori ini.</Text>
          </View>
        ) : (
          filteredHistory.map(item => (
            <BookingListItem
              key={item.id}
              item={item}
              isRiwayat={true}
              onPress={() => setSelectedBooking(item)}
            />
          ))
        )}
      </ScrollView>

      <Modal visible={selectedBooking !== null} transparent animationType="slide" onRequestClose={() => setSelectedBooking(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Proses Pengajuan</Text>
              <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                <Icon name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>
            {selectedBooking ? (
              <View style={styles.modalBody}>
                <Text style={styles.modalRoomName}>{(selectedBooking.ruang as any)?.nama || 'Ruangan'}</Text>
                <Text style={styles.modalSubTitle}>{selectedBooking.tanggal} • {selectedBooking.waktuMulai} WIB</Text>
                <View style={styles.modalTimeline}>
                  {getTimelineSteps(selectedBooking).map((step, index) => (
                    <View key={step.title} style={styles.timelineRow}>
                      <View style={styles.timelineMarkerContainer}>
                        <View style={[styles.timelineMarker, step.active ? styles.timelineMarkerActive : styles.timelineMarkerInactive]} />
                        {index < getTimelineSteps(selectedBooking).length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineTitleRow}>
                          <Text style={[styles.timelineTitle, step.active ? styles.timelineTitleActive : styles.timelineTitleInactive]}>{step.title}</Text>
                          <Text style={[styles.timelineStatusLabel, step.active ? styles.timelineStatusLabelActive : styles.timelineStatusLabelInactive]}>{step.statusLabel}</Text>
                        </View>
                        <Text style={styles.timelineDescription}>{step.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalBody: {
    paddingBottom: 16,
  },
  modalRoomName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubTitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  modalTimeline: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineMarkerContainer: {
    width: 24,
    alignItems: 'center',
  },
  timelineMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  timelineMarkerActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  timelineMarkerInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  timelineLine: {
    position: 'absolute',
    top: 14,
    left: 11,
    width: 2,
    height: '100%',
    backgroundColor: '#CBD5E1',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineTitleActive: {
    color: '#0F172A',
  },
  timelineTitleInactive: {
    color: '#64748B',
  },
  timelineStatusLabel: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontWeight: '700',
  },
  timelineStatusLabelActive: {
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
  },
  timelineStatusLabelInactive: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  timelineDescription: {
    marginTop: 4,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
});
