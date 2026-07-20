import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from '../components/AppIcon';

export const GuideScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Alur Kerja, 1: Aturan, 2: Kontak

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Pusat Bantuan</Text>
        <Text style={styles.subtitle}>Panduan penggunaan sistem UniRoom UNIMUS.</Text>

        {/* Tab switcher */}
        <View style={styles.tabContainer}>
          {['Alur Kerja', 'Aturan', 'Kontak'].map((tab, idx) => (
            <TouchableOpacity 
              key={tab}
              style={[styles.tab, activeTab === idx && styles.tabActive]}
              onPress={() => setActiveTab(idx)}
            >
              <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Card */}
        <View style={styles.card}>
          {activeTab === 0 && (
            <View style={styles.stepList}>
              <View style={styles.stepRow}>
                <View style={styles.stepNumContainer}><Text style={styles.stepNumText}>1</Text></View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Pilih & Ajukan</Text>
                  <Text style={styles.stepDesc}>Temukan ruangan yang kosong melalui menu Cari, isi detail keperluan, lalu tekan tombol Ajukan.</Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumContainer}><Text style={styles.stepNumText}>2</Text></View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Verifikasi RT</Text>
                  <Text style={styles.stepDesc}>Admin Rumah Tangga akan memvalidasi permohonan Anda. Pantau status di menu Riwayat.</Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumContainer}><Text style={styles.stepNumText}>3</Text></View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Otorisasi Final</Text>
                  <Text style={styles.stepDesc}>Kepala RT memberikan persetujuan akhir. Setelah itu, ruangan siap digunakan sesuai jadwal.</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 1 && (
            <View style={styles.ruleList}>
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}><Icon name="checkbox-marked-circle-outline" size={16} color="#10B981" /><Text style={[styles.ruleItem, { marginLeft: 8 }]}>Dilarang membawa makanan/minuman berbau menyengat ke dalam ruangan.</Text></View>
              </View>
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}><Icon name="checkbox-marked-circle-outline" size={16} color="#10B981" /><Text style={[styles.ruleItem, { marginLeft: 8 }]}>Wajib menjaga kebersihan dan kerapian kursi setelah pemakaian.</Text></View>
              </View>
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}><Icon name="checkbox-marked-circle-outline" size={16} color="#10B981" /><Text style={[styles.ruleItem, { marginLeft: 8 }]}>Pastikan AC, lampu, dan proyektor telah dimatikan saat meninggalkan ruangan.</Text></View>
              </View>
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}><Icon name="checkbox-marked-circle-outline" size={16} color="#10B981" /><Text style={[styles.ruleItem, { marginLeft: 8 }]}>Gunakan ruangan sesuai dengan durasi waktu yang telah disetujui.</Text></View>
              </View>
            </View>
          )}

          {activeTab === 2 && (
            <View style={styles.contactList}>
              <Text style={styles.contactTitle}>BIRO RUMAH TANGGA UNIMUS</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Icon name="phone-outline" size={16} color="#1E293B" />
                <Text style={[styles.contactItem, { marginLeft: 8 }]}>Ext. 204 (Lantai 2 GKB Rektorat)</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="email-outline" size={16} color="#1E293B" />
                <Text style={[styles.contactItem, { marginLeft: 8 }]}>bauk@unimus.ac.id</Text>
              </View>
            </View>
          )}
        </View>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  stepList: {
    flexDirection: 'column',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumContainer: {
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  ruleList: {
    flexDirection: 'column',
  },
  ruleItem: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 12,
  },
  contactList: {
    flexDirection: 'column',
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  contactItem: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
});
