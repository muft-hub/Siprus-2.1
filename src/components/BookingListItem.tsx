import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Peminjaman, PeminjamanStatus } from '../types';
import Icon from './AppIcon';
import { StatusTag } from './StatusTag';
import { generateSuratIzinPDF } from '../components/pdfGenerator';

interface BookingListItemProps {
  item: Peminjaman;
  isRiwayat?: boolean;
  onPress?: () => void;
}

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

export const BookingListItem: React.FC<BookingListItemProps> = ({ item, isRiwayat = false, onPress }) => {
  // Mencegah error TypeScript secara paksa dengan mengecek beberapa kemungkinan nama properti
  const namaRuangan = (item.ruang as any)?.nama || (item.ruang as any)?.namaRuangan || (item as any).namaRuangan || 'Fasilitas / Ruangan';
  const detailKegiatan = (item as any).kegiatan || (item as any).keperluan || (item as any).tujuan || (item as any).agenda || (item as any).keterangan || 'Detail Kegiatan';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
    >
      
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

      {isRiwayat && (
        <View style={styles.timelineContainer}>
          {getTimelineSteps(item).map((step, index) => (
            <View key={step.title} style={styles.timelineRow}>
              <View style={styles.timelineMarkerContainer}>
                <View style={[styles.timelineMarker, step.active ? styles.timelineMarkerActive : styles.timelineMarkerInactive]} />
                {index < getTimelineSteps(item).length - 1 && <View style={styles.timelineLine} />}
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
      )}

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.timeInfo}>
          <Icon name="calendar-outline" size={14} color="#64748B" />
          <Text style={[styles.footerText, { marginLeft: 6 }]}>{item.tanggal}</Text>
          <Text style={styles.footerSpace}>   </Text>
          <Icon name="clock-outline" size={14} color="#64748B" />
          <Text style={[styles.footerText, { marginLeft: 6 }]}>{item.waktuMulai} WIB</Text>
        </View>
        <Text style={styles.idText}>ID: #{item.id}</Text>
      </View>

      {/* 4. TOMBOL CETAK (HANYA DI RIWAYAT & JIKA DISETUJUI) */}
      {isRiwayat && item.status === PeminjamanStatus.DISETUJUI && (
        <TouchableOpacity 
          style={styles.printBtn} 
          onPress={() => generateSuratIzinPDF(item)}
        >
          <Icon name="file-document-outline" size={14} color="#059669" />
          <Text style={[styles.printBtnText, { marginLeft: 8 }]}>Cetak Surat Izin</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  printBtnText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 12,
  },
  timelineContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 14,
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