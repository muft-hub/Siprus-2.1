# TODO - Tanggal DatePicker di BookingScreen (react-native + Expo)

## Rencana perubahan
- [ ] Analisis kebutuhan date picker (Expo/RN) dan dependency yang dibutuhkan.
- [ ] Install/siapkan library date picker iOS yang sesuai (kemungkinan `@react-native-community/datetimepicker`).
- [x] Buat komponen/pola UI:
  - [x] Ganti `TextInput` tanggal di `BookingScreen.tsx` menjadi tombol DatePicker-style (fallback) yang aman tanpa library.
  - [ ] Setelah library DatePicker terinstall, aktifkan picker agar memilih tanggal mengubah state `tanggal` ke format `YYYY-MM-DD`.

- [ ] Pastikan form booking tidak pecah:
  - [ ] `createBooking` tetap mengirim `tanggal` dalam string `YYYY-MM-DD`.
  - [ ] Validasi tetap jalan.
- [ ] Jalankan build/dev untuk verifikasi:
  - [ ] Jalankan `npm run ios` (Expo) dan cek picker tanggal.
  - [ ] Tes pilih tanggal beberapa hari berbeda.

## Catatan
- Fokus sesuai permintaan: **pakai datepicker saja** (tanpa custom dropdown wheel).

