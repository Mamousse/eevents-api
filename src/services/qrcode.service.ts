import {injectable, BindingScope} from '@loopback/core';
import * as QRCode from 'qrcode';

@injectable({scope: BindingScope.TRANSIENT})
export class QrcodeService {
  constructor() {}

  /**
   * Génère un QR code au format base64 pour une réservation
   * @param reservationId - ID de la réservation
   * @param eventId - ID de l'événement
   * @returns QR code en base64
   */
  async generateQRCode(reservationId: string, eventId: string): Promise<string> {
    try {
      // Données à encoder dans le QR code
      const qrData = JSON.stringify({
        reservationId,
        eventId,
        timestamp: new Date().toISOString(),
      });

      // Génération du QR code en base64
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      throw new Error('Impossible de générer le QR code');
    }
  }

  /**
   * Décode les données d'un QR code
   * @param qrCodeData - Données du QR code
   * @returns Objet contenant reservationId et eventId
   */
  decodeQRCode(qrCodeData: string): {
    reservationId: string;
    eventId: string;
    timestamp: string;
  } {
    try {
      const decoded = JSON.parse(qrCodeData);
      return decoded;
    } catch (error) {
      console.error('Erreur lors du décodage du QR code:', error);
      throw new Error('QR code invalide');
    }
  }
}
