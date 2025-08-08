
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

  return encodeURIComponent(message);
};

export const generateAnticipoConfirmationMessage = (event: Event, anticipoNumber: number, amount: number): string => {
  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalAnticipos = (event.anticipo1Amount || 0) + (event.anticipo2Amount || 0) + (event.anticipo3Amount || 0);
  const remainingBalance = event.totalAmount - totalAnticipos;

  const message = `✅ ¡Hola ${event.customerName}!

Confirmamos que hemos recibido tu ANTICIPO ${anticipoNumber} por $${amount} para el evento de ${event.childName}.

📅 Fecha del evento: ${eventDate} a las ${event.time}
📦 Paquete: ${event.packageType}
💰 Total del evento: $${event.totalAmount}
💳 Total de anticipos pagados: $${totalAnticipos}
💵 Saldo pendiente: $${remainingBalance}

${remainingBalance > 0 ? 
  '⏰ Recuerda que puedes completar el pago antes del evento.' : 
  '🎉 ¡Felicidades! Tu evento está completamente pagado.'
}

¡Gracias por confiar en Abrakadabra! 🎈✨`;

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

export const sendWhatsAppCancellation = (event: Event): void => {
  const message = generateCancellationMessage(event);
  const phoneNumber = event.customerPhone.replace(/\D/g, '');
  const url = `https://wa.me/${phoneNumber}?text=${message}`;
  
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
};

export const sendWhatsAppAnticipoConfirmation = (event: Event, anticipoNumber: number, amount: number): void => {
  const message = generateAnticipoConfirmationMessage(event, anticipoNumber, amount);
  const phoneNumber = event.customerPhone.replace(/\D/g, '');
  const url = `https://wa.me/${phoneNumber}?text=${message}`;
  
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
};
