
import { Event } from '../types';
import { Linking, Platform } from 'react-native';

// FIXED: Helper function to parse date string correctly without timezone issues
const parseDateString = (dateString: string): { year: number; month: number; day: number } => {
  const parts = dateString.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10) - 1, // Convert to 0-based month
    day: parseInt(parts[2], 10)
  };
};

// FIXED: Helper function to get day of week correctly without timezone issues
const getDayOfWeek = (dateString: string): number => {
  const { year, month, day } = parseDateString(dateString);
  // Create date in local timezone to avoid day shifting
  const date = new Date(year, month, day);
  return date.getDay(); // 0 = Sunday, 1 = Monday, etc.
};

// FIXED: Helper function to format date for display without timezone issues
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const { year, month, day } = parseDateString(dateString);
    const dayOfWeek = getDayOfWeek(dateString);
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    console.log(`📅 WHATSAPP: Formatting date ${dateString}`);
    console.log(`   - Parsed: ${day}/${month + 1}/${year}`);
    console.log(`   - Day of week: ${dayOfWeek} (${dayNames[dayOfWeek]})`);
    
    return `${dayNames[dayOfWeek]} ${day} de ${monthNames[month]} de ${year}`;
  } catch (error) {
    console.error('❌ Error formatting date for WhatsApp:', error);
    return dateString;
  }
};

// UPDATED: Calculate cost based on package type and day of the week
export const calculateEventCost = (dateString: string, packageType: string = 'Abra'): number => {
  if (!dateString) return 0;
  
  try {
    // Use the same date parsing logic as the calendar to avoid timezone issues
    const dayOfWeek = getDayOfWeek(dateString);
    
    console.log(`📅 COST CALCULATION: Calculating cost for date: ${dateString}`);
    console.log(`📅 COST CALCULATION: Package: ${packageType}`);
    console.log(`📅 COST CALCULATION: Day of week: ${dayOfWeek} (${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek]})`);
    
    // Define pricing for each package
    const pricing = {
      'Abra': {
        weekday: 4000,    // Monday to Friday
        saturday: 6000,   // Saturday
        sunday: 5000      // Sunday
      },
      'Kadabra': {
        weekday: 12000,   // Monday to Friday
        saturday: 14000,  // Saturday
        sunday: 13000     // Sunday
      },
      'Abrakadabra': {
        weekday: 35000,   // Monday to Friday
        saturday: 40000,  // Saturday
        sunday: 37500     // Sunday
      }
    };

    const packagePricing = pricing[packageType as keyof typeof pricing] || pricing['Abra'];
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Monday to Friday
      console.log(`💰 COST CALCULATION: ${packageType} Monday-Friday rate: $${packagePricing.weekday.toLocaleString()}`);
      return packagePricing.weekday;
    } else if (dayOfWeek === 6) {
      // Saturday
      console.log(`💰 COST CALCULATION: ${packageType} Saturday rate: $${packagePricing.saturday.toLocaleString()}`);
      return packagePricing.saturday;
    } else if (dayOfWeek === 0) {
      // Sunday
      console.log(`💰 COST CALCULATION: ${packageType} Sunday rate: $${packagePricing.sunday.toLocaleString()}`);
      return packagePricing.sunday;
    }
    
    return 0; // Fallback
  } catch (error) {
    console.error('❌ Error calculating event cost:', error);
    return 0; // Fallback
  }
};

// Helper function to get day name in Spanish
export const getDayName = (dateString: string): string => {
  if (!dateString) return 'Fecha no válida';
  
  try {
    const dayOfWeek = getDayOfWeek(dateString);
    
    const dayNames = [
      'Domingo',
      'Lunes', 
      'Martes', 
      'Miércoles', 
      'Jueves', 
      'Viernes', 
      'Sábado'
    ];
    
    return dayNames[dayOfWeek] || 'Día desconocido';
  } catch (error) {
    console.error('❌ Error getting day name:', error);
    return 'Fecha no válida';
  }
};

// UPDATED: Helper function to get pricing info for display
export const getPricingInfo = (dateString: string, packageType: string = 'Abra'): { cost: number; dayName: string; priceCategory: string } => {
  const cost = calculateEventCost(dateString, packageType);
  const dayName = getDayName(dateString);
  
  let priceCategory = '';
  if (!dateString) {
    priceCategory = 'Selecciona fecha';
  } else {
    const dayOfWeek = getDayOfWeek(dateString);
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      priceCategory = 'Lunes a Viernes';
    } else if (dayOfWeek === 6) {
      priceCategory = 'Sábado';
    } else if (dayOfWeek === 0) {
      priceCategory = 'Domingo';
    }
  }
  
  return { cost, dayName, priceCategory };
};

// FIXED: Generate WhatsApp message with correct date formatting
export const generateWhatsAppMessage = (event: Event): string => {
  console.log('📱 WHATSAPP: Generating message for event:', event.id);
  console.log('📱 WHATSAPP: Event date:', event.date);
  
  // Use the same date formatting logic to avoid timezone issues
  const eventDate = formatDateForDisplay(event.date);
  console.log('📱 WHATSAPP: Formatted date:', eventDate);

  const anticipoPaid = event.anticipo1Amount || event.deposit || 0;
  
  // Calculate the correct cost based on the day of the week and package type
  const correctCost = calculateEventCost(event.date, event.packageType);
  const actualTotal = correctCost > 0 ? correctCost : event.totalAmount;
  const actualRemaining = actualTotal - anticipoPaid;

  const message = `🎉 ¡Hola ${event.customerName}!

Te recordamos que tienes reservado el evento de ${event.childName} para el ${eventDate} a las ${event.time}.

📦 Paquete: ${event.packageType}
💰 Total: $${actualTotal.toLocaleString()}
💳 Anticipo pagado: $${anticipoPaid.toLocaleString()}
💵 Saldo pendiente: $${actualRemaining.toLocaleString()}

${actualRemaining > 0 ? 
  '⏰ Recuerda completar el pago antes del evento.' : 
  '🎉 ¡Tu evento está completamente pagado!'
}

¡Nos vemos pronto en Abrakadabra! 🎈✨`;

  console.log('📱 WHATSAPP: Generated message preview:', message.substring(0, 100) + '...');
  return message;
};

// FIXED: Generate cancellation message with correct date formatting
export const generateCancellationMessage = (event: Event): string => {
  console.log('📱 WHATSAPP: Generating cancellation message for event:', event.id);
  console.log('📱 WHATSAPP: Event date:', event.date);
  
  // Use the same date formatting logic to avoid timezone issues
  const eventDate = formatDateForDisplay(event.date);
  console.log('📱 WHATSAPP: Formatted cancellation date:', eventDate);

  const anticipoPaid = event.anticipo1Amount || event.deposit || 0;

  const message = `❌ Hola ${event.customerName},

Lamentamos informarte que hemos tenido que CANCELAR el evento de ${event.childName} programado para el ${eventDate} a las ${event.time}.

📦 Paquete cancelado: ${event.packageType}
💰 Monto a reembolsar: $${anticipoPaid.toLocaleString()}

Nos pondremos en contacto contigo para coordinar el reembolso y reprogramar si es necesario.

Disculpa las molestias.
Equipo Abrakadabra 🎈`;

  console.log('📱 WHATSAPP: Generated cancellation message preview:', message.substring(0, 100) + '...');
  return message;
};

// FIXED: Generate anticipo confirmation message with correct date formatting
export const generateAnticipoConfirmationMessage = (event: Event, amount: number): string => {
  console.log('📱 WHATSAPP: Generating anticipo confirmation for event:', event.id);
  console.log('📱 WHATSAPP: Event date:', event.date);
  
  // Use the same date formatting logic to avoid timezone issues
  const eventDate = formatDateForDisplay(event.date);
  console.log('📱 WHATSAPP: Formatted anticipo date:', eventDate);

  const totalAnticipos = event.anticipo1Amount || amount;
  
  // Calculate the correct cost based on the day of the week and package type
  const correctCost = calculateEventCost(event.date, event.packageType);
  const actualTotal = correctCost > 0 ? correctCost : event.totalAmount;
  const remainingBalance = actualTotal - totalAnticipos;

  const message = `✅ ¡Hola ${event.customerName}!

Confirmamos que hemos recibido tu ANTICIPO por $${amount.toLocaleString()} para el evento de ${event.childName}.

📅 Fecha del evento: ${eventDate} a las ${event.time}
📦 Paquete: ${event.packageType}
💰 Total del evento: $${actualTotal.toLocaleString()}
💳 Anticipo pagado: $${totalAnticipos.toLocaleString()}
💵 Saldo pendiente: $${remainingBalance.toLocaleString()}

${remainingBalance > 0 ? 
  '⏰ Recuerda que puedes completar el pago antes del evento.' : 
  '🎉 ¡Felicidades! Tu evento está completamente pagado.'
}

¡Gracias por confiar en Abrakadabra! 🎈✨`;

  console.log('📱 WHATSAPP: Generated anticipo message preview:', message.substring(0, 100) + '...');
  return message;
};

// UPDATED: Open WhatsApp Business app directly instead of browser
const openWhatsApp = async (phoneNumber: string, message: string): Promise<void> => {
  try {
    console.log('📱 Opening WhatsApp Business with message for:', phoneNumber);
    
    // Clean phone number (remove all non-digits)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming Mexico +52)
    const formattedPhone = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // UPDATED: Try WhatsApp Business first, then regular WhatsApp
    // WhatsApp Business URL scheme
    const whatsappBusinessUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    // Regular WhatsApp URL scheme (fallback)
    const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    // Web fallback
    const webUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    console.log('🔗 Trying WhatsApp Business URL:', whatsappBusinessUrl);
    
    // Try WhatsApp Business first
    const canOpenBusiness = await Linking.canOpenURL(whatsappBusinessUrl);
    
    if (canOpenBusiness) {
      console.log('✅ Opening WhatsApp Business app');
      await Linking.openURL(whatsappBusinessUrl);
      return;
    }
    
    console.log('⚠️ WhatsApp Business not available, trying regular WhatsApp');
    
    // Try regular WhatsApp
    const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpenWhatsApp) {
      console.log('✅ Opening regular WhatsApp app');
      await Linking.openURL(whatsappUrl);
      return;
    }
    
    console.log('⚠️ WhatsApp app not available, opening web version');
    
    // Fallback to web version
    await Linking.openURL(webUrl);
    console.log('✅ Opened WhatsApp web version');
  } catch (error: any) {
    console.error('❌ Error opening WhatsApp:', error);
    throw new Error(`No se pudo abrir WhatsApp: ${error.message}`);
  }
};

export const sendWhatsAppReminder = async (event: Event): Promise<void> => {
  try {
    console.log('📱 Sending WhatsApp reminder for event:', event.id);
    console.log('📱 Event date being sent:', event.date);
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
    console.log('📱 Event date being sent:', event.date);
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
    console.log('📱 Event date being sent:', event.date);
    const message = generateAnticipoConfirmationMessage(event, amount);
    await openWhatsApp(event.customerPhone, message);
  } catch (error: any) {
    console.error('❌ Error sending WhatsApp anticipo confirmation:', error);
    throw error;
  }
};
