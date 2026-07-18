import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, Alert, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import { Role } from '../types';

interface ProfileScreenProps {
  onLogoutSuccess: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogoutSuccess }) => {
  const { currentUser, updateProfile, updatePassword, logout } = useApp();

  const [isSettingsMode, setIsSettingsMode] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editEmail, setEditEmail] = useState(currentUser?.email || "");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);

  const userRole = currentUser?.role || Role.GUEST;
  const isGuest = userRole === Role.GUEST;

  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Perhatian', 'Nama dan Email tidak boleh kosong.');
      return;
    }
    setLoading(true);
    const result = await updateProfile(editName, editEmail);
    setLoading(false);
    Alert.alert(result.success ? 'Sukses' : 'Gagal', result.message);
  };

  const handleUpdatePassword = async () => {
    if (!oldPw || !newPw || !confirmPw) {
      Alert.alert('Perhatian', 'Harap lengkapi semua bidang password.');
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Perhatian', 'Password baru dan konfirmasi tidak cocok.');
      return;
    }

    setLoading(true);
    const result = await updatePassword(oldPw, newPw);
    setLoading(false);
    if (result.success) {
      Alert.alert('Sukses', result.message);
      setOldPw("");
      setNewPw("");
      setConfirmPw("");
    } else {
      Alert.alert('Gagal', result.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    onLogoutSuccess();
  };

  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '?';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Profile Avatar & Header */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.profileName}>{currentUser?.name || 'Guest'}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email || '-'}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{userRole}</Text>
          </View>
        </View>

        {isGuest ? (
          <View style={styles.guestBanner}>
            <Text style={styles.guestIcon}>⚠️</Text>
            <Text style={styles.guestTitle}>Mode Penelusuran (Guest)</Text>
            <Text style={styles.guestText}>
              Sesi Guest hanya diizinkan untuk melihat ketersediaan ruangan. Untuk melakukan peminjaman, silakan login menggunakan akun Mahasiswa.
            </Text>
          </View>
        ) : (
          !isSettingsMode ? (
            <View style={styles.infoCard}>
              <Text style={styles.cardHeader}>INFORMASI AKUN</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID Pengenal</Text>
                <Text style={styles.infoValue}>#{currentUser?.id || '-'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status Sesi</Text>
                <Text style={styles.infoValue}>{currentUser?.token ? 'Aktif (Tervalidasi)' : 'Terbatas'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Keamanan</Text>
                <Text style={styles.infoValue}>SSO Unimus Active</Text>
              </View>
            </View>
          ) : (
            <View style={{ width: '100%' }}>
              {/* Personal Info Edit Card */}
              <View style={styles.settingsCard}>
                <Text style={styles.cardHeader}>INFORMASI PRIBADI</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nama Lengkap:</Text>
                  <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Email Pengguna:</Text>
                  <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
                </View>

                <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateProfile} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.updateBtnText}>Simpan Perubahan</Text>}
                </TouchableOpacity>
              </View>

              {/* Password Edit Card */}
              <View style={[styles.settingsCard, { marginTop: 16 }]}>
                <Text style={styles.cardHeader}>KEAMANAN SANDI</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Password Saat Ini:</Text>
                  <TextInput style={styles.input} secureTextEntry value={oldPw} onChangeText={setOldPw} />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Password Baru:</Text>
                  <TextInput style={styles.input} secureTextEntry value={newPw} onChangeText={setNewPw} placeholder="Minimal 6 karakter" />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Konfirmasi Password:</Text>
                  <TextInput style={styles.input} secureTextEntry value={confirmPw} onChangeText={setConfirmPw} placeholder="Ulangi sandi baru" />
                </View>

                <TouchableOpacity style={[styles.updateBtn, { backgroundColor: '#1E293B' }]} onPress={handleUpdatePassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.updateBtnText}>Perbarui Password</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )
        )}

        {/* Buttons */}
        <View style={styles.actionSection}>
          {!isGuest && (
            <TouchableOpacity 
              style={[styles.outlineBtn, isSettingsMode && { backgroundColor: '#F1F5F9' }]}
              onPress={() => setIsSettingsMode(!isSettingsMode)}
            >
              <Text style={styles.outlineBtnText}>
                {isSettingsMode ? 'Kembali' : '⚙️ Pengaturan Akun'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.primaryBtn, isGuest ? { backgroundColor: '#4F46E5' } : { backgroundColor: '#EF4444' }]} 
            onPress={handleLogout}
          >
            <Text style={styles.primaryBtnText}>
              {isGuest ? 'LOGIN AKUN MAHASISWA' : '🚪 KELUAR APLIKASI'}
            </Text>
          </TouchableOpacity>
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
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 16,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
  roleBadgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: 'bold',
  },
  guestBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
  },
  guestIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#92400E',
  },
  guestText: {
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginVertical: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  updateBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionSection: {
    width: '100%',
    marginTop: 12,
  },
  outlineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  outlineBtnText: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
