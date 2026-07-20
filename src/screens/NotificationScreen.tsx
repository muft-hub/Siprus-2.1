import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  TouchableOpacity, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import Icon from '../components/AppIcon';

interface NotificationScreenProps {
  onBack: () => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
  const { notifications, markAllNotificationsRead, isLoading, refreshData } = useApp();

  const unreadCount = notifications.filter(it => !it.dibaca).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="arrow-left" size={16} color="#475569" />
            <Text style={[styles.backBtnText, { marginLeft: 8 }]}>Kembali</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Pemberitahuan</Text>

        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.markReadBtn} onPress={markAllNotificationsRead}>
            <Text style={styles.markReadText}>Baca Semua</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={['#4F46E5']} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="bell-outline" size={56} color="#94A3B8" />
            <Text style={styles.emptyText}>Belum ada pemberitahuan baru.</Text>
          </View>
        ) : (
          notifications.map(item => (
            <View 
              key={item.id} 
              style={[styles.notificationCard, !item.dibaca && styles.notificationUnread]}
            >
              <View style={[styles.iconCircle, !item.dibaca && styles.iconCircleUnread]}>
                <Icon name="bell-outline" size={18} color={!item.dibaca ? '#FFFFFF' : '#64748B'} />
              </View>

              <View style={styles.contentContainer}>
                <Text style={[styles.messageText, !item.dibaca && styles.messageUnread]}>
                  {item.pesan}
                </Text>
                <Text style={styles.dateText}>{item.createdAt}</Text>
              </View>

              {!item.dibaca && <View style={styles.unreadDot} />}
            </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backBtnText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  markReadBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  markReadText: {
    fontSize: 11,
    color: '#4F46E5',
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
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'bold',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notificationUnread: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: {
    backgroundColor: '#4F46E5',
  },
  iconCircleText: {
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  messageText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  messageUnread: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },
});
