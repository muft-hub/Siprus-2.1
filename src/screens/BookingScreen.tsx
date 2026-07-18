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

// Konfigurasi bahasa Indonesia
LocaleConfig.locales['id'] = {
  monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  dayNames: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  dayNamesShort: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  today: 'Hari ini'
};
LocaleConfig.defaultLocale = 'id';

interface BookingScreenProps {
  onNavigateToHistory: () => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({ onNavigateToHistory }) => {
  // --- ANIMASI HOVERING ---
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8] 
  });

  const { currentUser, gedungList, ruanganList, createBooking, isLoading, peminjamanList } = useApp();
  
  // Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGedungId, setSelectedGedungId] = useState<number | null>(null);
  const [selectedLantai, setSelectedLantai] = useState<string>('Semua');
  
  // Booking states
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Ruangan | null>(null);
  const [tanggal, setTanggal] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal & Picker States
  const [isCalendarViewVisible, setIsCalendarViewVisible] = useState(false);
  const [selectedGlobalDate, setSelectedGlobalDate] = useState('');
  const [isUserEditedTime, setIsUserEditedTime] = useState(false);
  const [activePickerTarget, setActivePickerTarget] = useState<'tanggal' | 'mulai' | 'selesai' | null>(null);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [startTimeValue, setStartTimeValue] = useState(new Date());
  const [endTimeValue, setEndTimeValue] = useState(new Date());
  const [dateValue, setDateValue] = useState(new Date());

  const pad2 = (n: number) => n.toString().padStart(2, '0');
  const toYYYYMMDD = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const toHHMM = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const roundUpToMinutes = (d: Date, stepMinutes: number) => { const ms = d.getTime(); const stepMs = stepMinutes * 60 * 1000; return new Date(Math.ceil(ms / stepMs) * stepMs); };

  useEffect(() => {
    const now = new Date();
    setTanggal(toYYYYMMDD(now));
    if(!selectedGlobalDate) setSelectedGlobalDate(toYYYYMMDD(now));
    if(!isUserEditedTime) {
      const start = roundUpToMinutes(now, 10);
      setWaktuMulai(toHHMM(start));
      setWaktuSelesai(toHHMM(new Date(start.getTime() + 2 * 60 * 60 * 1000)));
    }
  }, []);

  const filteredRuangan = ruanganList.filter(room => {
    const matchGedung = selectedGedungId === null || room.gedungId === selectedGedungId;
    const matchLantai = selectedLantai === 'Semua' || room.lantai.toString() === selectedLantai;
    const matchKeyword = !searchKeyword || room.nama.toLowerCase().includes(searchKeyword.toLowerCase()) || room.kode.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchGedung && matchLantai && matchKeyword;
  });

  const markedDates = useMemo(() => {
    const marks: any = {};
    peminjamanList?.forEach((b: any) => { if(b.status !== 'DITOLAK') marks[b.tanggal] = { marked: true, dotColor: '#F59E0B' }; });
    marks[selectedGlobalDate] = { ...marks[selectedGlobalDate], selected: true, selectedColor: '#4F46E5' };
    return marks;
  }, [peminjamanList, selectedGlobalDate]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Pencarian Ruangan</Text>
        </View>

        {/* --- FILTER SEKSYEN (GEDUNG & LANTAI) --- */}
        <View style={styles.filterSection}>
          <TextInput style={styles.searchInput} placeholder="🔍 Cari nama ruangan..." value={searchKeyword} onChangeText={setSearchKeyword} />
          
          <Text style={styles.filterLabel}>Gedung:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
             <TouchableOpacity style={[styles.chip, selectedGedungId === null && styles.activeChip]} onPress={() => setSelectedGedungId(null)}>
               <Text style={[styles.chipText, selectedGedungId === null && styles.activeChipText]}>Semua</Text>
             </TouchableOpacity>
             {gedungList.map(g => (
                <TouchableOpacity key={g.id} style={[styles.chip, selectedGedungId === g.id && styles.activeChip]} onPress={() => setSelectedGedungId(g.id)}>
                   <Text style={[styles.chipText, selectedGedungId === g.id && styles.activeChipText]}>{g.nama}</Text>
                </TouchableOpacity>
             ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Lantai:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
            {['Semua', '1', '2', '3', '4', '5'].map(lt => (
              <TouchableOpacity 
                key={lt}
                style={[styles.chip, selectedLantai === lt && styles.activeChip]}
                onPress={() => setSelectedLantai(lt)}
              >
                <Text style={[styles.chipText, selectedLantai === lt && styles.activeChipText]}>
                  {lt === 'Semua' ? 'Semua' : `Lantai ${lt}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {filteredRuangan.map(room => (
          <RoomCard key={room.id} ruangan={room} onClick={() => setSelectedRoomForBooking(room)} />
        ))}
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <Animated.View style={[styles.fabContainer, { transform: [{ translateY: floatInterpolate }] }]}>
        <TouchableOpacity style={styles.fabCalendar} onPress={() => setIsCalendarViewVisible(true)} activeOpacity={0.8}>
          <Image source={require('../assets/icon-kalender.png')} style={styles.fabIcon} />
        </TouchableOpacity>
      </Animated.View>

      {/* SWIPE MODAL KALENDER */}
      <SwipeModal 
        isVisible={isCalendarViewVisible} 
        onSwipeComplete={() => setIsCalendarViewVisible(false)}
        swipeDirection="down"
        useNativeDriver={true}
        style={styles.bottomModal}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.dragHandleWrapper}><View style={styles.dragHandle} /></View>
          <Calendar markedDates={markedDates} onDayPress={(day: any) => setSelectedGlobalDate(day.dateString)} />
        </View>
      </SwipeModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 100 },
  headerRow: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  filterSection: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 20 },
  searchInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, backgroundColor: '#F8FAFC' },
  filterLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginTop: 12, marginBottom: 6 },
  horizontalChips: { flexDirection: 'row' },
  chip: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  activeChip: { backgroundColor: '#4F46E5' },
  chipText: { fontSize: 12, color: '#475569' },
  activeChipText: { color: '#FFFFFF', fontWeight: 'bold' },

  fabContainer: { position: 'absolute', bottom: 30, right: 30, zIndex: 100 },
  fabCalendar: {
    backgroundColor: '#FFFFFF',
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: { width: 32, height: 32, resizeMode: 'contain' },
  
  bottomModal: { justifyContent: 'flex-end', margin: 0 },
  bottomSheetContainer: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%' },
  dragHandleWrapper: { width: '100%', alignItems: 'center', padding: 12 },
  dragHandle: { width: 50, height: 5, backgroundColor: '#CBD5E1', borderRadius: 3 },
});