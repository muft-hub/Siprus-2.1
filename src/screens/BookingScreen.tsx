import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Modal as RNModal, Alert, ActivityIndicator, SafeAreaView, Platform, Image, Animated
} from 'react-native';
import { useApp } from '../viewmodel/AppViewModel';
import { RoomCard } from '../components/RoomCard';
import { Role, Ruangan } from '../types';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import SwipeModal from 'react-native-modal';

// Konfigurasi Bahasa Indonesia
LocaleConfig.locales['id'] = {
  monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  dayNames: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  dayNamesShort: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  today: 'Hari ini'
};
LocaleConfig.defaultLocale = 'id';

export const BookingScreen: React.FC<{ onNavigateToHistory: () => void }> = ({ onNavigateToHistory }) => {
  // --- ANIMASI FAB ---
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);
  const floatInterpolate = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  const { currentUser, gedungList, ruanganList, createBooking, isLoading, peminjamanList } = useApp();
  
  // Filter States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGedungId, setSelectedGedungId] = useState<number | null>(null);
  const [selectedLantai, setSelectedLantai] = useState<string>('Semua');
  
  // Modal States
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Ruangan | null>(null);
  const [isCalendarViewVisible, setIsCalendarViewVisible] = useState(false);
  const [selectedGlobalDate, setSelectedGlobalDate] = useState('');
  
  // Form States (Pindah ke Form Reservasi)
  const [tanggal, setTanggal] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Native Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  const [dateValue, setDateValue] = useState(new Date());
  const [startTimeValue, setStartTimeValue] = useState(new Date());
  const [endTimeValue, setEndTimeValue] = useState(new Date());

  // Logic Helpers
  const pad2 = (n: number) => n.toString().padStart(2, '0');
  const toYYYYMMDD = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const toHHMM = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  
  useEffect(() => {
    const now = new Date();
    setTanggal(toYYYYMMDD(now));
    setWaktuMulai(toHHMM(now));
    
    // Default selesai 1 jam kemudian
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setWaktuSelesai(toHHMM(oneHourLater));
    setEndTimeValue(oneHourLater);

    if(!selectedGlobalDate) setSelectedGlobalDate(toYYYYMMDD(now));
  }, []);

  // Buka Form & Reset state input form sesuai kamar yang dipilih
  const handleOpenBookingForm = (room: Ruangan) => {
    setSelectedRoomForBooking(room);
    setKeperluan('');
  };

  const handleCreateBooking = async () => {
    if (!selectedRoomForBooking) return;
    if (!keperluan.trim()) {
      Alert.alert('Eror', 'Mohon isi keperluan peminjaman ruangan.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking({
        ruanganId: selectedRoomForBooking.id,
        tanggal,
        waktuMulai,
        waktuSelesai,
        keperluan,
        userId: currentUser?.id || 0
      });
      Alert.alert('Sukses', 'Berhasil melakukan reservasi ruangan!', [
        { text: 'OK', onPress: () => {
          setSelectedRoomForBooking(null);
          onNavigateToHistory();
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Terjadi kesalahan saat memproses booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRuangan = ruanganList.filter(room => {
    const matchGedung = selectedGedungId === null || room.gedungId === selectedGedungId;
    const matchLantai = selectedLantai === 'Semua' || room.lantai.toString() === selectedLantai;
    const matchKeyword = !searchKeyword || room.nama.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchGedung && matchLantai && matchKeyword;
  });

  const markedDates = useMemo(() => {
    const marks: any = {};
    peminjamanList?.forEach((b: any) => { if(b.status !== 'DITOLAK') marks[b.tanggal] = { marked: true, dotColor: '#F59E0B' }; });
    marks[selectedGlobalDate] = { ...marks[selectedGlobalDate], selected: true, selectedColor: '#4F46E5' };
    return marks;
  }, [peminjamanList, selectedGlobalDate]);

  const bookingsForSelectedDate = useMemo(() => {
    if (!peminjamanList) return [];
    return peminjamanList.filter((b: any) => b.tanggal === selectedGlobalDate && b.status !== 'DITOLAK');
  }, [peminjamanList, selectedGlobalDate]);

  const getRoomName = (roomId: number) => ruanganList.find(r => r.id === roomId)?.nama || "Ruangan";

  return (
    <SafeAreaView style={styles.safe}>
      {/* 
        removeClippedSubviews & scrollEventThrottle dioptimalkan untuk performa layar refresh rate tinggi (90Hz/120Hz).
        nestedScrollEnabled diset true agar scroll parent tidak macet karena adanya scroll horizontal di dalam.
      */}
      <ScrollView 
        contentContainerStyle={styles.scroll}
        removeClippedSubviews={Platform.OS === 'android'}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        <Text style={styles.title}>Pencarian Ruangan</Text>
        
        {/* --- FILTER SECTION --- */}
        <View style={styles.filterSection}>
          <TextInput style={styles.searchInput} placeholder="🔍 Cari nama ruangan..." value={searchKeyword} onChangeText={setSearchKeyword} />
          
          <Text style={styles.filterLabel}>Gedung:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips} nestedScrollEnabled={true}>
             <TouchableOpacity style={[styles.chip, selectedGedungId === null && styles.activeChip]} onPress={() => setSelectedGedungId(null)}><Text style={[styles.chipText, selectedGedungId === null && styles.activeChipText]}>Semua</Text></TouchableOpacity>
             {gedungList.map(g => <TouchableOpacity key={g.id} style={[styles.chip, selectedGedungId === g.id && styles.activeChip]} onPress={() => setSelectedGedungId(g.id)}><Text style={[styles.chipText, selectedGedungId === g.id && styles.activeChipText]}>{g.nama}</Text></TouchableOpacity>)}
          </ScrollView>
          
          <Text style={styles.filterLabel}>Lantai:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips} nestedScrollEnabled={true}>
            {['Semua', '1', '2', '3', '4', '5'].map(lt => <TouchableOpacity key={lt} style={[styles.chip, selectedLantai === lt && styles.activeChip]} onPress={() => setSelectedLantai(lt)}><Text style={[styles.chipText, selectedLantai === lt && styles.activeChipText]}>{lt === 'Semua' ? 'Semua' : `Lantai ${lt}`}</Text></TouchableOpacity>)}
          </ScrollView>
        </View>

        {filteredRuangan.map(room => (
          <RoomCard key={room.id} ruangan={room} onClick={() => handleOpenBookingForm(room)} />
        ))}
      </ScrollView>

      {/* FAB HOVER */}
      <Animated.View style={[styles.fabContainer, { transform: [{ translateY: floatInterpolate }] }]}>
        <TouchableOpacity style={styles.fabCalendar} onPress={() => setIsCalendarViewVisible(true)}><Image source={require('../assets/icon-kalender.png')} style={styles.fabIcon} /></TouchableOpacity>
      </Animated.View>

      {/* MODAL KALENDER & DETAIL */}
      <SwipeModal isVisible={isCalendarViewVisible} onSwipeComplete={() => setIsCalendarViewVisible(false)} swipeDirection="down" useNativeDriver={true} style={styles.bottomModal}>
        <View style={styles.bottomSheetContainer}>
          <View style={styles.dragHandleWrapper}><View style={styles.dragHandle} /></View>
          <Calendar markedDates={markedDates} onDayPress={(day: any) => setSelectedGlobalDate(day.dateString)} />
          <ScrollView style={styles.eventListContainer} nestedScrollEnabled={true}>
             <Text style={styles.eventListHeader}>Jadwal: {selectedGlobalDate}</Text>
             {bookingsForSelectedDate.length === 0 ? <Text style={styles.emptyText}>Tidak ada jadwal.</Text> : 
             bookingsForSelectedDate.map((b: any, i: number) => (
               <View key={i} style={styles.eventCard}>
                 <View style={styles.eventCardHeader}><Text style={styles.eventRoomName}>{getRoomName(b.ruanganId)}</Text><View style={styles.eventStatusBadge}><Text style={styles.eventStatusText}>{b.status}</Text></View></View>
                 <Text style={styles.eventTime}>⏰ {b.waktuMulai} - {b.waktuSelesai} WIB</Text>
                 <Text style={styles.eventNotes}>📝 {b.keperluan}</Text>
               </View>
             ))}
          </ScrollView>
        </View>
      </SwipeModal>

      {/* MODAL FORM RESERVASI DENGAN INPUT LENGKAP */}
      <RNModal visible={selectedRoomForBooking !== null} animationType="slide" transparent={true} onRequestClose={() => setSelectedRoomForBooking(null)}>
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Form Peminjaman</Text>
             <Text style={styles.modalRoomName}>{selectedRoomForBooking?.nama}</Text>
             
             <ScrollView style={{maxHeight: 400}} showsVerticalScrollIndicator={false}>
               {/* Input Tanggal */}
               <Text style={styles.formLabel}>Tanggal Peminjaman</Text>
               <TouchableOpacity style={styles.formPickerButton} onPress={() => setShowDatePicker(true)}>
                 <Text style={styles.formPickerText}>📆 {tanggal}</Text>
               </TouchableOpacity>

               {/* Input Waktu Mulai */}
               <Text style={styles.formLabel}>Waktu Mulai</Text>
               <TouchableOpacity style={styles.formPickerButton} onPress={() => setShowStartTimePicker(true)}>
                 <Text style={styles.formPickerText}>⏰ {waktuMulai} WIB</Text>
               </TouchableOpacity>

               {/* Input Waktu Selesai */}
               <Text style={styles.formLabel}>Waktu Selesai</Text>
               <TouchableOpacity style={styles.formPickerButton} onPress={() => setShowEndTimePicker(true)}>
                 <Text style={styles.formPickerText}>⏰ {waktuSelesai} WIB</Text>
               </TouchableOpacity>

               {/* Input Keperluan */}
               <Text style={styles.formLabel}>Keperluan / Acara</Text>
               <TextInput 
                 style={[styles.searchInput, { height: 80, textAlignVertical: 'top' }]} 
                 placeholder="Contoh: Rapat Koordinasi Divisi IT..." 
                 value={keperluan} 
                 onChangeText={setKeperluan}
                 multiline={true}
               />
             </ScrollView>

             {/* Tombol Aksi */}
             <View style={styles.modalActionWrapper}>
               <TouchableOpacity style={[styles.btnAction, styles.btnCancel]} onPress={() => setSelectedRoomForBooking(null)} disabled={isSubmitting}>
                 <Text style={styles.btnCancelText}>Batal</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.btnAction, styles.btnSubmit]} onPress={handleCreateBooking} disabled={isSubmitting}>
                 {isSubmitting ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.btnSubmitText}>Booking</Text>}
               </TouchableOpacity>
             </View>
           </View>
         </View>

         {/* --- NATIVE COMPONENT DATETIME PICKERS --- */}
         {showDatePicker && (
           <DateTimePicker
             value={dateValue}
             mode="date"
             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
             minimumDate={new Date()}
             onChange={(event: DateTimePickerEvent, date?: Date) => {
               setShowDatePicker(false);
               if (date) {
                 setDateValue(date);
                 setTanggal(toYYYYMMDD(date));
               }
             }}
           />
         )}

         {showStartTimePicker && (
           <DateTimePicker
             value={startTimeValue}
             mode="time"
             is24Hour={true}
             display="spinner"
             onChange={(event: DateTimePickerEvent, time?: Date) => {
               setShowStartTimePicker(false);
               if (time) {
                 setStartTimeValue(time);
                 setWaktuMulai(toHHMM(time));
               }
             }}
           />
         )}

         {showEndTimePicker && (
           <DateTimePicker
             value={endTimeValue}
             mode="time"
             is24Hour={true}
             display="spinner"
             onChange={(event: DateTimePickerEvent, time?: Date) => {
               setShowEndTimePicker(false);
               if (time) {
                 setEndTimeValue(time);
                 setWaktuSelesai(toHHMM(time));
               }
             }}
           />
         )}
      </RNModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  filterSection: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 20 },
  searchInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, backgroundColor: '#F8FAFC', fontSize: 14, color: '#334155' },
  filterLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginTop: 12, marginBottom: 6 },
  horizontalChips: { flexDirection: 'row' },
  chip: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, height: 32, justifyContent: 'center' },
  activeChip: { backgroundColor: '#4F46E5' },
  chipText: { fontSize: 12, color: '#475569' },
  activeChipText: { color: '#FFFFFF', fontWeight: 'bold' },
  fabContainer: { position: 'absolute', bottom: 30, right: 30, zIndex: 100 },
  fabCalendar: { backgroundColor: '#FFFFFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8 },
  fabIcon: { width: 32, height: 32, resizeMode: 'contain' },
  bottomModal: { justifyContent: 'flex-end', margin: 0 },
  bottomSheetContainer: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%' },
  dragHandleWrapper: { width: '100%', alignItems: 'center', padding: 12 },
  dragHandle: { width: 50, height: 5, backgroundColor: '#CBD5E1', borderRadius: 3 },
  eventListContainer: { flex: 1, padding: 16 },
  eventListHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  eventCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  eventCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  eventRoomName: { fontSize: 15, fontWeight: 'bold', color: '#4F46E5' },
  eventStatusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  eventStatusText: { fontSize: 10, fontWeight: 'bold', color: '#D97706' },
  eventTime: { fontSize: 12, color: '#334155', fontWeight: 'bold' },
  eventNotes: { fontSize: 12, color: '#64748B', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#64748B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#0F172A' },
  modalRoomName: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 4, color: '#4F46E5', marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginTop: 12, marginBottom: 6 },
  formPickerButton: { borderText: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  formPickerText: { fontSize: 14, color: '#334155' },
  modalActionWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  btnAction: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  btnCancelText: { color: '#64748B', fontWeight: 'bold', fontSize: 15 },
  btnSubmit: { backgroundColor: '#4F46E5' },
  btnSubmitText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }
});