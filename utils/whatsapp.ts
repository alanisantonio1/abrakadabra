
import { Event } from '../types';
import { Linking, Platform } from 'react-native';

export const generateWhatsAppMessage = (event: Event): string => {
  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const message = `🎉 ¡Hola ${event.customerName}!

Te recordamos que tienes reservado el evento de ${event.childName} para el ${eventDate} a las ${event.time}.

📦 Paquete: ${event.packageType}
💰 Total: $${event.totalAmount}
💳 Anticipo pagado: $${event.deposit}
💵 Saldo pendiente: $${event.remainingAmount}

¡Nos vemos pronto en Abrakadabra! 🎈✨`;

  return message;
};

export const generateCancellationMessage = (event: Event): string => {
  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const message = `❌ Hola ${event.customerName},

Lamentamos informarte que hemos tenido que CANCELAR el evento de ${event.childName} programado para el ${eventDate} a las ${event.time}.

📦 Paquete cancelado: ${event.packageType}
💰 Monto a reembolsar: $${event.deposit}

Nos pondremos en contacto contigo para coordinar el reembolso y reprogramar si es necesario.

Disculpa las molestias.
Equipo Abrakadabra 🎈`;

  return message;
};

export const generateAnticipoConfirmationMessage = (event: Event, amount: number): string => {
  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalAnticipos = event.anticipo1Amount || 0;
  const remainingBalance = event.totalAmount - totalAnticipos;

  const message = `✅ ¡Hola ${event.customerName}!

Confirmamos que hemos recibido tu ANTICIPO por $${amount} para el evento de ${event.childName}.

📅 Fecha del evento: ${eventDate} a las ${event.time}
📦 Paquete: ${event.packageType}
💰 Total del evento: $${event.totalAmount}
💳 Anticipo pagado: $${totalAnticipos}
💵 Saldo pendiente: $${remainingBalance}

${remainingBalance > 0 ? 
  '⏰ Recuerda que puedes completar el pago antes del evento.' : 
  '🎉 ¡Felicidades! Tu evento está completamente pagado.'
}

¡Gracias por confiar en Abrakadabra! 🎈✨`;

  return message;
};

const openWhatsApp = async (phoneNumber: string, message: string): Promise<void> => {
  try {
    console.log('📱 Opening WhatsApp with message for:', phoneNumber);
    
    // Clean phone number (remove all non-digits)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    console.log('🔗 WhatsApp URL:', whatsappUrl);
    
    // Check if WhatsApp can be opened
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      console.log('✅ WhatsApp opened successfully');
    } else {
      console.warn('⚠️ WhatsApp not available, trying web version');
      
      // Fallback to web version
      const webUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
      await Linking.openURL(webUrl);
    }
  } catch (error: any) {
    console.error('❌ Error opening WhatsApp:', error);
    throw new Error(`No se pudo abrir WhatsApp: ${error.message}`);
  }
};

export const sendWhatsAppReminder = async (event: Event): Promise<void> => {
  try {
    console.log('📱 Sending WhatsApp reminder for event:', event.id);
    const message = generateWhatsAppMessage(event);
    await openWhatsApp(event.customerPhone, message);
  } catch (error: any) {
    console.error('❌ Error sending WhatsApp reminder:', error);
    throw error;
  }
};

export const sendWhatsAppCancellation = async (event: Event): Promise<void> => {
  try {
    console.log('📱 Sending WhatsApp cancellation for event:', event.id);
    const message = generateCancellationMessage(event);
    await openWhatsApp(event.customerPhone, message);
  } catch (error: any) {
    console.error('❌ Error sending WhatsApp cancellation:', error);
    throw error;
  }
};

export const sendWhatsAppAnticipoConfirmation = async (event: Event, amount: number): Promise<void> => {
  try {
    console.log('📱 Sending WhatsApp anticipo confirmation for event:', event.id);
    const message = generateAnticipoConfirmationMessage(event, amount);
    await openWhatsApp(event.customerPhone, message);
  } catch (error: any) {
    console.error('❌ Error sending WhatsApp anticipo confirmation:', error);
    throw error;
  }
};
