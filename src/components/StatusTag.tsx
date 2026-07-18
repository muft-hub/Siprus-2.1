import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PeminjamanStatus } from '../types';

interface StatusTagProps {
  status: PeminjamanStatus;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  let bgColor = '#FEF3C7';
  let textColor = '#D97706';
  let label = 'VERIFIKASI RT';

  switch (status) {
    case PeminjamanStatus.MENUNGGU_RT:
      bgColor = '#FEF3C7';
      textColor = '#D97706';
      label = 'VERIFIKASI RT';
      break;
    case PeminjamanStatus.MENUNGGU_KEPALA:
      bgColor = '#DBEAFE';
      textColor = '#2563EB';
      label = 'VERIFIKASI SIPRUS';
      break;
    case PeminjamanStatus.DISETUJUI:
      bgColor = '#D1FAE5';
      textColor = '#059669';
      label = 'DISETUJUI';
      break;
    case PeminjamanStatus.DITOLAK_RT:
    case PeminjamanStatus.DITOLAK_KEPALA:
      bgColor = '#FEE2E2';
      textColor = '#DC2626';
      label = 'DITOLAK';
      break;
    case PeminjamanStatus.BUTUH_REVISI:
      bgColor = '#F3E8FF';
      textColor = '#7C3AED';
      label = 'REVISI';
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});
