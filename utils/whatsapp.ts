
import { Event } from '../types';

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

  return encodeURIComponent(message);
};

export const sendWhatsAppReminder = (event: Event): void => {
  const message = generateWhatsAppMessage(event);
  const phoneNumber = event.customerPhone.replace(/\D/g, '');
  const url = `https://wa.me/${phoneNumber}?text=${message}`;
  
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
};
