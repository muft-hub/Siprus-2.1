import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  TouchableOpacity, SafeAreaView 
} from 'react-native';
import Icon from '../components/AppIcon';
import { useApp } from '../viewmodel/AppViewModel';
import { BookingListItem } from '../components/BookingListItem';
import { Role, PeminjamanStatus } from '../types';

interface DashboardScreenProps {
  onNavigateToBooking: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToBooking }) => {
  const { currentUser, peminjamanList, isLoading, refreshData } = useApp();

  const userRole = currentUser?.role || Role.GUEST;
  const totalPeminjaman = peminjamanList.length;
  const pendingPeminjaman = peminjamanList.filter(it => 
    it.status === PeminjamanStatus.MENUNGGU_RT || it.status === PeminjamanStatus.MENUNGGU_KEPALA
  ).length;
  const approvedPeminjaman = peminjamanList.filter(it => 
    it.status === PeminjamanStatus.DISETUJUI
  ).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={['#4F46E5']} />
        }
      >
        {/* Workspace Banner */}
        <View style={styles.headerBanner}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{userRole} WORKSPACE</Text>
          </View>
          <Text style={styles.welcomeText}>Selamat Datang, {currentUser?.name || 'Guest'}!</Text>
          <Text style={styles.welcomeSub}>
            Kelola dan lacak ketersediaan ruangan kampus dalam satu genggaman.
          </Text>

          {userRole === Role.MAHASISWA && (
            <TouchableOpacity style={styles.pinjamBtn} onPress={onNavigateToBooking}>
              <View style={styles.pinjamBtnContent}>
                <Icon name="plus-circle-outline" size={16} color="#1E293B" />
                <Text style={styles.pinjamBtnText}> PINJAM RUANGAN</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Metric Grid */}
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Icon name="file-document-outline" size={18} color="#3B82F6" style={styles.metricIcon} />
            <Text style={styles.metricVal}>{totalPeminjaman}</Text>
            <Text style={styles.metricLabel}>TOTAL</Text>
          </View>

          <View style={styles.metricCard}>
            <Icon name="clock-outline" size={18} color="#F59E0B" style={styles.metricIcon} />
            <Text style={styles.metricVal}>{pendingPeminjaman}</Text>
            <Text style={styles.metricLabel}>PENDING</Text>
          </View>

          <View style={styles.metricCard}>
            <Icon name="check-circle-outline" size={18} color="#10B981" style={styles.metricIcon} />
            <Text style={styles.metricVal}>{approvedPeminjaman}</Text>
            <Text style={styles.metricLabel}>SETUJU</Text>
          </View>
        </View>

        {/* Section header */}
        <View style={styles.sectionHeaderRow}>
          <Icon name="lightning-bolt-outline" size={16} color="#0F172A" />
          <Text style={styles.sectionHeader}> Reservasi Terbaru</Text>
        </View>

        {peminjamanList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Belum ada data reservasi saat ini.</Text>
          </View>
        ) : (
          peminjamanList.slice(0, 5).map((item) => (
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
    paddingBottom: 32,
  },
  headerBanner: {
    backgroundColor: '#4F46E5', // Royal Blue
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  pinjamBtn: {
    backgroundColor: '#FBBF24', // Gold Accent
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  pinjamBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinjamBtnText: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  metricIcon: {
    marginBottom: 6,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginLeft: 6,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyText: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
