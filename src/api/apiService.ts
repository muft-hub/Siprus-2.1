import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LoginResponse, Gedung, Ruangan, Peminjaman, ResponseModel, 
  ProfileResponse, BookingRequest, ValidateRequest, SwitchRoomRequest, 
  Notification 
} from '../types';

const API_BASE_URL = 'https://siprus-api.onrender.com/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token dynamically if available
api.interceptors.request.use(
  async (config) => {
    try {
      const userJson = await AsyncStorage.getItem('@user_session');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user && user.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch auth token from AsyncStorage', e);
    }
    
    // Logging equivalent to HttpLoggingInterceptor.Level.BODY
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('[API REQUEST DATA]', JSON.stringify(config.data, null, 2));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Log details & handle standard status errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[API ERROR] ${error.response.status} - ${error.response.config.url}`, error.response.data);
    } else {
      console.error('[API ERROR] Network Error', error.message);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  async login(credentials: Record<string, string>): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('auth/login', credentials);
    return response.data;
  },

  // ── Gedung ────────────────────────────────────────────────────────────────
  async getGedung(): Promise<Gedung[]> {
    const response = await api.get<Gedung[]>('gedung');
    return response.data;
  },

  async addGedung(body: { kode: string; nama: string; lokasi?: string }): Promise<ResponseModel> {
    const response = await api.post<ResponseModel>('gedung', body);
    return response.data;
  },

  // ── Ruangan ───────────────────────────────────────────────────────────────
  async getRooms(): Promise<Ruangan[]> {
    const response = await api.get<Ruangan[]>('ruang');
    return response.data;
  },

  async getAvailableRooms(params: {
    tanggal: string;
    waktuMulai: string;
    waktuSelesai: string;
    kapasitas?: string;
    gedungId?: string;
  }): Promise<Ruangan[]> {
    const response = await api.get<Ruangan[]>('ruang/available', { params });
    return response.data;
  },

  async addRuangan(body: {
    kode: string;
    nama: string;
    gedungId: number;
    lantai: number;
    kapasitas: number;
    jenis: string;
    fasilitas?: string;
  }): Promise<ResponseModel> {
    const response = await api.post<ResponseModel>('ruang', body);
    return response.data;
  },

  // ── Booking ───────────────────────────────────────────────────────────────
  async getMyHistory(): Promise<Peminjaman[]> {
    const response = await api.get<Peminjaman[]>('booking/history');
    return response.data;
  },

  async getAllBookings(): Promise<Peminjaman[]> {
    const response = await api.get<Peminjaman[]>('booking/all');
    return response.data;
  },

  async createBooking(body: BookingRequest): Promise<ResponseModel> {
    const response = await api.post<ResponseModel>('booking', body);
    return response.data;
  },

  async validateBooking(id: number, body: ValidateRequest): Promise<ResponseModel> {
    const response = await api.put<ResponseModel>(`booking/${id}/validate`, body);
    return response.data;
  },

  async switchRoom(id: number, body: SwitchRoomRequest): Promise<ResponseModel> {
    const response = await api.put<ResponseModel>(`booking/${id}/transfer`, body);
    return response.data;
  },

  // ── Profil ────────────────────────────────────────────────────────────────
  async updateProfile(body: { name: string; email: string }): Promise<ProfileResponse> {
    const response = await api.put<ProfileResponse>('auth/profile', body);
    return response.data;
  },

  async updatePassword(body: Record<string, string>): Promise<ResponseModel> {
    const response = await api.put<ResponseModel>('auth/password', body);
    return response.data;
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('notifications');
    return response.data;
  },

  async markAllNotificationsAsRead(): Promise<ResponseModel> {
    const response = await api.put<ResponseModel>('notifications/read-all');
    return response.data;
  },

  async markNotificationAsRead(id: number): Promise<ResponseModel> {
    const response = await api.put<ResponseModel>(`notifications/${id}/read`);
    return response.data;
  }
};
