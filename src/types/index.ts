export enum Role {
  MAHASISWA = "MAHASISWA",
  ADMIN_RT = "ADMIN_RT",
  KEPALA_RT = "KEPALA_RT",
  GUEST = "GUEST"
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  token?: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export enum PeminjamanStatus {
  MENUNGGU_RT = "MENUNGGU_RT",
  MENUNGGU_KEPALA = "MENUNGGU_KEPALA",
  DISETUJUI = "DISETUJUI",
  DITOLAK_RT = "DITOLAK_RT",
  DITOLAK_KEPALA = "DITOLAK_KEPALA",
  BUTUH_REVISI = "BUTUH_REVISI"
}

export interface Gedung {
  id: number;
  kode: string;
  nama: string;
  lokasi?: string | null;
}

export interface Ruangan {
  id: number;
  kode: string;
  nama: string;
  gedungId: number;
  lantai: number;
  kapasitas: number;
  jenis: string;
  fasilitas?: string | null;
  gedung?: Gedung | null;
}

export interface Peminjaman {
  id: number;
  userId: number;
  ruangId: number;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  keperluan: string;
  status: PeminjamanStatus;
  catatanRt?: string | null;
  catatanKepala?: string | null;
  catatanRevisi?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  user?: User | null;
  ruang?: Ruangan | null;
}

export interface ResponseModel {
  message?: string | null;
  error?: string | null;
  success?: boolean | null;
}

export interface ProfileResponse {
  message: string;
  user: User;
}

export interface BookingRequest {
  ruangId: number;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  keperluan: string;
}

export interface ValidateRequest {
  action: "APPROVE" | "REJECT" | "REVISE" | "TRANSFER";
  alasan: string;
}

export interface SwitchRoomRequest {
  newRuangId: number;
  alasan: string;
}

export interface Notification {
  id: number;
  userId: number;
  pesan: string;
  dibaca: boolean;
  createdAt: string;
}
