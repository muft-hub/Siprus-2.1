import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../api/apiService';
import { User, Peminjaman, Gedung, Ruangan, Notification, Role, PeminjamanStatus } from '../types';

interface AppContextType {
  currentUser: User | null;
  peminjamanList: Peminjaman[];
  gedungList: Gedung[];
  ruanganList: Ruangan[];
  notifications: Notification[];
  apiStatusMessage: string;
  isLoading: boolean;
  
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; message: string }>;
  loginWithDemo: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  createBooking: (ruangId: number, tanggal: string, waktuMulai: string, waktuSelesai: string, keperluan: string) => Promise<{ success: boolean; message: string }>;
  validateBooking: (id: number, action: "APPROVE" | "REJECT" | "REVISE" | "TRANSFER", alasan: string) => Promise<{ success: boolean; message: string }>;
  switchRoom: (id: number, newRuangId: number, alasan: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (oldPw: string, newPw: string) => Promise<{ success: boolean; message: string }>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  
  getRememberedCredentials: () => Promise<{ email: string; pw: string; checked: boolean }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [peminjamanList, setPeminjamanList] = useState<Peminjaman[]>([]);
  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [apiStatusMessage, setApiStatusMessage] = useState<string>('Terhubung ke Server Siprus');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const userJson = await AsyncStorage.getItem('@user_session');
        if (userJson) {
          const user = JSON.parse(userJson);
          if (user && user.token) {
            setCurrentUser(user);
          }
        }
      } catch (e) {
        console.error('Error loading session', e);
      }
    };
    loadSession();
  }, []);

  // Fetch updated data from server whenever current user changes
  useEffect(() => {
    if (currentUser) {
      refreshData();
    } else {
      setPeminjamanList([]);
      setGedungList([]);
      setRuanganList([]);
      setNotifications([]);
    }
  }, [currentUser]);

  const refreshData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setApiStatusMessage('Sinkronisasi data...');
    try {
      // Parallel loading like in Jetpack ViewModel using Coroutines
      const [peminjamans, gedungs, rooms, notifs] = await Promise.all([
        currentUser.role === Role.MAHASISWA ? apiService.getMyHistory() : apiService.getAllBookings(),
        apiService.getGedung(),
        apiService.getRooms(),
        apiService.getNotifications()
      ]);

      setPeminjamanList(peminjamans || []);
      setGedungList(gedungs || []);
      setRuanganList(rooms || []);
      setNotifications(notifs || []);
      setApiStatusMessage('Terhubung ke Server Siprus');
    } catch (e: any) {
      setApiStatusMessage('Gagal sinkronisasi data');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      const loggedInUser: User = { ...response.user, token: response.token };
      
      await AsyncStorage.setItem('@user_session', JSON.stringify(loggedInUser));
      
      if (rememberMe) {
        await AsyncStorage.setItem('@remember_email', email);
        await AsyncStorage.setItem('@remember_pw', password);
        await AsyncStorage.setItem('@remember_checked', 'true');
      } else {
        await AsyncStorage.removeItem('@remember_email');
        await AsyncStorage.removeItem('@remember_pw');
        await AsyncStorage.removeItem('@remember_checked');
      }

      setCurrentUser(loggedInUser);
      setIsLoading(false);
      return { success: true, message: 'Berhasil login' };
    } catch (e: any) {
      setIsLoading(false);
      const msg = e.response?.data?.message || e.response?.data?.error || 'Gagal login, silakan coba lagi';
      return { success: false, message: msg };
    }
  };

  const loginWithDemo = async (role: Role) => {
    const demoUser: User = {
      id: 999,
      name: `Demo ${role}`,
      email: `demo.${role.toLowerCase()}@unimus.ac.id`,
      role: role,
      token: 'demo-token-1234'
    };
    await AsyncStorage.setItem('@user_session', JSON.stringify(demoUser));
    setCurrentUser(demoUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@user_session');
    setCurrentUser(null);
  };

  const createBooking = async (ruangId: number, tanggal: string, waktuMulai: string, waktuSelesai: string, keperluan: string) => {
    try {
      const response = await apiService.createBooking({ ruangId, tanggal, waktuMulai, waktuSelesai, keperluan });
      await refreshData();
      return { success: true, message: response.message || 'Reservasi berhasil diajukan!' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Gagal membuat reservasi' };
    }
  };

  const validateBooking = async (id: number, action: "APPROVE" | "REJECT" | "REVISE" | "TRANSFER", alasan: string) => {
    try {
      const response = await apiService.validateBooking(id, { action, alasan });
      await refreshData();
      return { success: true, message: response.message || 'Verifikasi berhasil disimpan!' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Gagal memverifikasi' };
    }
  };

  const switchRoom = async (id: number, newRuangId: number, alasan: string) => {
    try {
      const response = await apiService.switchRoom(id, { newRuangId, alasan });
      await refreshData();
      return { success: true, message: response.message || 'Pengalihan ruangan berhasil!' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Gagal mengalihkan ruangan' };
    }
  };

  const updateProfile = async (name: string, email: string) => {
    try {
      const response = await apiService.updateProfile({ name, email });
      if (currentUser) {
        const updated = { ...currentUser, name: response.user.name, email: response.user.email };
        await AsyncStorage.setItem('@user_session', JSON.stringify(updated));
        setCurrentUser(updated);
      }
      return { success: true, message: response.message || 'Profil berhasil diperbarui' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Gagal memperbarui profil' };
    }
  };

  const updatePassword = async (oldPw: string, newPw: string) => {
    try {
      const response = await apiService.updatePassword({ oldPassword: oldPw, newPassword: newPw });
      return { success: true, message: response.message || 'Password berhasil diperbarui' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Gagal memperbarui password' };
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, dibaca: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getRememberedCredentials = async () => {
    const email = await AsyncStorage.getItem('@remember_email') || '';
    const pw = await AsyncStorage.getItem('@remember_pw') || '';
    const checked = (await AsyncStorage.getItem('@remember_checked')) === 'true';
    return { email, pw, checked };
  };

  return (
    <AppContext.Provider value={{
      currentUser, peminjamanList, gedungList, ruanganList, notifications, apiStatusMessage, isLoading,
      login, loginWithDemo, logout, refreshData, createBooking, validateBooking, switchRoom,
      updateProfile, updatePassword, markNotificationRead, markAllNotificationsRead, getRememberedCredentials
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
