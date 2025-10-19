import {injectable, BindingScope} from '@loopback/core';
import {Twilio} from 'twilio';

@injectable({scope: BindingScope.TRANSIENT})
export class WhatsappService {
  private client: Twilio;

  constructor() {
    // Configuration Twilio depuis les variables d'environnement
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured. WhatsApp service will not work.');
    } else {
      this.client = new Twilio(accountSid, authToken);
    }
  }

  /**
   * Envoie un message WhatsApp avec le QR code de réservation
   * @param phoneNumber - Numéro WhatsApp du destinataire (format international)
   * @param qrCodeBase64 - QR code en base64
   * @param reservationDetails - Détails de la réservation
   */
  async sendReservationQRCode(
    phoneNumber: string,
    qrCodeBase64: string,
    reservationDetails: {
      eventName: string;
      eventDate: string;
      nombrePlaces: number;
      montantTotal: number;
      nom: string;
      prenom: string;
    },
  ): Promise<void> {
    if (!this.client) {
      throw new Error('WhatsApp service is not configured. Please set TWILIO credentials.');
    }

    try {
      // Formater le numéro de téléphone pour WhatsApp
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      // Message personnalisé
      const message = `Bonjour ${reservationDetails.prenom} ${reservationDetails.nom},\n\n` +
        `Votre réservation pour l'événement "${reservationDetails.eventName}" a été confirmée ! ✅\n\n` +
        `📅 Date: ${reservationDetails.eventDate}\n` +
        `🎫 Nombre de places: ${reservationDetails.nombrePlaces}\n` +
        `💰 Montant payé: ${reservationDetails.montantTotal} FCFA\n\n` +
        `Veuillez présenter ce QR code à l'entrée de l'événement.\n\n` +
        `Merci de votre confiance ! 🎉`;

      // Envoi du message avec le QR code
      await this.client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formattedNumber}`,
        body: message,
        mediaUrl: [qrCodeBase64],
      });

      console.log(`QR code envoyé avec succès au ${formattedNumber}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message WhatsApp:', error);
      throw new Error('Impossible d\'envoyer le QR code par WhatsApp');
    }
  }

  /**
   * Envoie un message WhatsApp pour partager un événement
   * @param phoneNumber - Numéro WhatsApp du destinataire
   * @param eventDetails - Détails de l'événement
   * @param eventImageUrl - URL de l'image de l'événement
   */
  async shareEvent(
    phoneNumber: string,
    eventDetails: {
      name: string;
      description: string;
      date: string;
      lieu: string;
      prixEntree: number;
    },
    eventImageUrl?: string,
  ): Promise<void> {
    if (!this.client) {
      throw new Error('WhatsApp service is not configured. Please set TWILIO credentials.');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      const message = `🎉 Découvrez cet événement incontournable !\n\n` +
        `📌 ${eventDetails.name}\n\n` +
        `📝 ${eventDetails.description}\n\n` +
        `📅 Date: ${eventDetails.date}\n` +
        `📍 Lieu: ${eventDetails.lieu}\n` +
        `💵 Prix: ${eventDetails.prixEntree} FCFA\n\n` +
        `Réservez dès maintenant ! 🎫`;

      const messageOptions: any = {
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formattedNumber}`,
        body: message,
      };

      if (eventImageUrl) {
        messageOptions.mediaUrl = [eventImageUrl];
      }

      await this.client.messages.create(messageOptions);

      console.log(`Événement partagé avec succès au ${formattedNumber}`);
    } catch (error) {
      console.error('Erreur lors du partage de l\'événement:', error);
      throw new Error('Impossible de partager l\'événement par WhatsApp');
    }
  }

  /**
   * Formate le numéro de téléphone au format international
   * @param phoneNumber - Numéro de téléphone
   * @returns Numéro formaté
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Supprimer tous les espaces et caractères spéciaux
    let formatted = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Si le numéro commence par 0, on le remplace par +225 (Côte d'Ivoire)
    if (formatted.startsWith('0')) {
      formatted = '+225' + formatted.substring(1);
    }

    // Si le numéro ne commence pas par +, on ajoute +225
    if (!formatted.startsWith('+')) {
      formatted = '+225' + formatted;
    }

    return formatted;
  }

  /**
   * Génère le lien WhatsApp pour partager un événement directement
   * @param eventDetails - Détails de l'événement
   * @returns Lien WhatsApp
   */
  generateShareLink(eventDetails: {
    name: string;
    description: string;
    date: string;
    lieu: string;
    prixEntree: number;
    eventUrl: string;
  }): string {
    const message = `🎉 Découvrez cet événement incontournable !\n\n` +
      `📌 ${eventDetails.name}\n\n` +
      `📝 ${eventDetails.description}\n\n` +
      `📅 Date: ${eventDetails.date}\n` +
      `📍 Lieu: ${eventDetails.lieu}\n` +
      `💵 Prix: ${eventDetails.prixEntree} FCFA\n\n` +
      `Réservez maintenant: ${eventDetails.eventUrl}`;

    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);

    // Retourner le lien WhatsApp
    return `https://wa.me/?text=${encodedMessage}`;
  }
}
