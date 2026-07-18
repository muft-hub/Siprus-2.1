import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Image, ScrollView, Switch, ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import { Role } from '../types';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, loginWithDemo, getRememberedCredentials, apiStatusMessage, isLoading } = useApp();
  
  const [email, setEmail] = useState('taufik@unimus.ac.id');
  const [password, setPassword] = useState('123');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const fetchSaved = async () => {
      const saved = await getRememberedCredentials();
      if (saved.checked) {
        setEmail(saved.email);
        setPassword(saved.pw);
        setRememberMe(true);
      }
    };
    fetchSaved();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Perhatian', 'Email dan password tidak boleh kosong.');
      return;
    }
    const result = await login(email, password, rememberMe);
    if (result.success) {
      onLoginSuccess();
    } else {
      Alert.alert('Login Gagal', result.message);
    }
  };

  const handleDemoLogin = async (role: Role) => {
    await loginWithDemo(role);
    onLoginSuccess();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status indicator badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            ● {apiStatusMessage}
          </Text>
        </View>

        {/* Logo and title */}
        <View style={styles.logoRow}>
          <Text style={styles.appTitle}>🔑 UNIROOM UNIMUS</Text>
        </View>

        <Text style={styles.slogan}>
          Sistem Digitalisasi{"\n"}Peminjaman Ruangan Kampus
        </Text>

        <Text style={styles.description}>
          Memudahkan civitas akademika Universitas Muhammadiyah Semarang melakukan pelacakan ketersediaan, reservasi, dan validasi ruangan kelas terintegrasi secara dinamis.
        </Text>

        {/* Login Form card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Selamat Datang</Text>
          <Text style={styles.subWelcome}>Silakan login dengan akun UNIMUS Anda</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL UNIMUS</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan email UNIMUS"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan sandi"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
              thumbColor={rememberMe ? '#FFFFFF' : '#F4F4F5'}
            />
            <Text style={styles.rememberText}>Ingat Saya</Text>
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, isLoading && styles.disabledBtn]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>Masuk ke Aplikasi →</Text>
            )}
          </TouchableOpacity>

          {/* Guest pathway */}
          <TouchableOpacity 
            style={styles.guestBtn}
            onPress={() => handleDemoLogin(Role.GUEST)}
          >
            <Text style={styles.guestBtnText}>Masuk Sesi Guest (Lihat Ketersediaan)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerVersion}>
          Siprus Version v2.6 • Universitas Muhammadiyah Semarang
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep Slate matching Jetpack blueGradient
  },
  scroll: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  statusText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '500',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  description: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    width: '100%',
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  subWelcome: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 8,
  },
  loginBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  disabledBtn: {
    backgroundColor: '#818CF8',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 32,
  },
});
