import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar 
} from 'react-native';
import { AppProvider, useApp } from './src/viewmodel/AppViewModel';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ValidationScreen } from './src/screens/ValidationScreen';
import { MasterDataScreen } from './src/screens/MasterDataScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { GuideScreen } from './src/screens/GuideScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { Role, PeminjamanStatus } from './src/types';

enum MainTab {
  BERANDA = 'BERANDA',
  CARI = 'CARI',
  RIWAYAT = 'RIWAYAT',
  VALIDASI = 'VALIDASI',
  MASTER = 'MASTER',
  LAPORAN = 'LAPORAN',
  PANDUAN = 'PANDUAN',
  PROFIL = 'PROFIL',
  NOTIFIKASI = 'NOTIFIKASI'
}

const MainContainer: React.FC = () => {
  const { currentUser, peminjamanList, notifications, logout } = useApp();
  const [activeTab, setActiveTab] = useState<MainTab>(MainTab.BERANDA);

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={() => setActiveTab(MainTab.BERANDA)} />;
  }

  const userRole = currentUser.role || Role.GUEST;

  // Calculate pending validation items for admins
  const pendingCount = peminjamanList.filter(p => {
    if (userRole === Role.ADMIN_RT) return p.status === PeminjamanStatus.MENUNGGU_RT;
    if (userRole === Role.KEPALA_RT) return p.status === PeminjamanStatus.MENUNGGU_KEPALA;
    return p.status === PeminjamanStatus.MENUNGGU_RT || p.status === PeminjamanStatus.MENUNGGU_KEPALA;
  }).length;

  const unreadNotificationsCount = notifications.filter(n => !n.dibaca).length;

  // Helper to render screens
  const renderScreen = () => {
    switch (activeTab) {
      case MainTab.BERANDA:
        return <DashboardScreen onNavigateToBooking={() => setActiveTab(MainTab.CARI)} />;
      case MainTab.CARI:
        return <BookingScreen onNavigateToHistory={() => setActiveTab(MainTab.RIWAYAT)} />;
      case MainTab.RIWAYAT:
        return <HistoryScreen />;
      case MainTab.VALIDASI:
        return <ValidationScreen />;
      case MainTab.MASTER:
        return <MasterDataScreen />;
      case MainTab.LAPORAN:
        return <ReportScreen />;
      case MainTab.PANDUAN:
        return <GuideScreen />;
      case MainTab.PROFIL:
        return <ProfileScreen onLogoutSuccess={() => setActiveTab(MainTab.BERANDA)} />;
      case MainTab.NOTIFIKASI:
        return <NotificationScreen onBack={() => setActiveTab(MainTab.BERANDA)} />;
      default:
        return <DashboardScreen onNavigateToBooking={() => setActiveTab(MainTab.CARI)} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top App Bar (Only visible if not on NotificationScreen to avoid double headers) */}
      {activeTab !== MainTab.NOTIFIKASI && (
        <View style={styles.topAppBar}>
          <View style={styles.topAppBarLeft}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🏢</Text>
            </View>
            <Text style={styles.topAppTitle}>UNIROOM</Text>
          </View>

          <View style={styles.topAppBarRight}>
            <TouchableOpacity 
              style={[styles.topBtn, activeTab === MainTab.PANDUAN && styles.topBtnActive]} 
              onPress={() => setActiveTab(MainTab.PANDUAN)}
            >
              <Text style={[styles.topBtnIcon, activeTab === MainTab.PANDUAN && styles.topBtnIconActive]}>📖</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.topBtn, activeTab === MainTab.NOTIFIKASI && styles.topBtnActive]} 
              onPress={() => setActiveTab(MainTab.NOTIFIKASI)}
            >
              <Text style={[styles.topBtnIcon, activeTab === MainTab.NOTIFIKASI && styles.topBtnIconActive]}>🔔</Text>
              {unreadNotificationsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.topBtn} onPress={logout}>
              <Text style={styles.topBtnIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content Stage */}
      <View style={styles.stage}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation Bar */}
      {activeTab !== MainTab.NOTIFIKASI && (
        <View style={styles.bottomBar}>
          
          {/* Beranda */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setActiveTab(MainTab.BERANDA)}
          >
            <Text style={[styles.navIcon, activeTab === MainTab.BERANDA && styles.navIconActive]}>🏠</Text>
            <Text style={[styles.navLabel, activeTab === MainTab.BERANDA && styles.navLabelActive]}>Beranda</Text>
          </TouchableOpacity>

          {/* Cari (Show only to Students & Guests) */}
          {userRole !== Role.ADMIN_RT && userRole !== Role.KEPALA_RT && (
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setActiveTab(MainTab.CARI)}
            >
              <Text style={[styles.navIcon, activeTab === MainTab.CARI && styles.navIconActive]}>🔍</Text>
              <Text style={[styles.navLabel, activeTab === MainTab.CARI && styles.navLabelActive]}>Cari</Text>
            </TouchableOpacity>
          )}

          {/* Riwayat (Students only) */}
          {userRole === Role.MAHASISWA && (
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setActiveTab(MainTab.RIWAYAT)}
            >
              <Text style={[styles.navIcon, activeTab === MainTab.RIWAYAT && styles.navIconActive]}>📄</Text>
              <Text style={[styles.navLabel, activeTab === MainTab.RIWAYAT && styles.navLabelActive]}>Riwayat</Text>
            </TouchableOpacity>
          )}

          {/* Validasi (Admins only) */}
          {(userRole === Role.ADMIN_RT || userRole === Role.KEPALA_RT) && (
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setActiveTab(MainTab.VALIDASI)}
            >
              <View>
                <Text style={[styles.navIcon, activeTab === MainTab.VALIDASI && styles.navIconActive]}>✅</Text>
                {pendingCount > 0 && (
                  <View style={styles.navBadge}>
                    <Text style={styles.navBadgeText}>{pendingCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.navLabel, activeTab === MainTab.VALIDASI && styles.navLabelActive]}>Validasi</Text>
            </TouchableOpacity>
          )}

          {/* Laporan (Admins only) */}
          {(userRole === Role.ADMIN_RT || userRole === Role.KEPALA_RT) && (
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setActiveTab(MainTab.LAPORAN)}
            >
              <Text style={[styles.navIcon, activeTab === MainTab.LAPORAN && styles.navIconActive]}>📊</Text>
              <Text style={[styles.navLabel, activeTab === MainTab.LAPORAN && styles.navLabelActive]}>Laporan</Text>
            </TouchableOpacity>
          )}

          {/* Master (Admins only) */}
          {(userRole === Role.ADMIN_RT || userRole === Role.KEPALA_RT) && (
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setActiveTab(MainTab.MASTER)}
            >
              <Text style={[styles.navIcon, activeTab === MainTab.MASTER && styles.navIconActive]}>🗄️</Text>
              <Text style={[styles.navLabel, activeTab === MainTab.MASTER && styles.navLabelActive]}>Master</Text>
            </TouchableOpacity>
          )}

          {/* Profil */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setActiveTab(MainTab.PROFIL)}
          >
            <Text style={[styles.navIcon, activeTab === MainTab.PROFIL && styles.navIconActive]}>👤</Text>
            <Text style={[styles.navLabel, activeTab === MainTab.PROFIL && styles.navLabelActive]}>Profil</Text>
          </TouchableOpacity>

        </View>
      )}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContainer />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topAppBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topAppBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
  },
  topAppTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginLeft: 10,
    letterSpacing: 1,
  },
  topAppBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  topBtnActive: {
    backgroundColor: '#4F46E5',
  },
  topBtnIcon: {
    fontSize: 16,
  },
  topBtnIconActive: {
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  stage: {
    flex: 1,
  },
  bottomBar: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
