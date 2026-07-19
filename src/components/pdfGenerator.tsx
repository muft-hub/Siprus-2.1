import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const generateSuratIzinPDF = async (booking: any) => {
  try {
    const htmlContent = `
      <html>
        <body>
          <h1>SURAT IZIN PEMAKAIAN RUANGAN</h1>
          <p>Agenda: ${booking.keperluan}</p>
          <p>Tanggal: ${booking.tanggal}</p>
          <!-- Tambahkan detail template HTML lainnya sesuai kebutuhan -->
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri);
  } catch (error) {
    Alert.alert('Eror', 'Gagal mencetak surat.');
  }
};