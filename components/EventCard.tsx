
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Event } from '../types';
import { sendWhatsAppReminder } from '../utils/whatsapp';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onMarkAsPaid?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress, onMarkAsPaid }) => {
  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const handleWhatsAppPress = () => {
    sendWhatsAppReminder(event);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.childName}>{event.childName}</Text>
          <Text style={styles.customerName}>{event.customerName}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{eventDate}</Text>
          <Text style={styles.time}>{event.time}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.packageContainer}>
          <Text style={styles.package}>Paquete {event.packageType}</Text>
          <Text style={styles.amount}>${event.totalAmount}</Text>
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.paymentText}>
            Anticipo: ${event.deposit} | Pendiente: ${event.remainingAmount}
          </Text>
          <View style={[styles.statusBadge, event.isPaid ? styles.paidBadge : styles.pendingBadge]}>
            <Text style={[styles.statusText, event.isPaid ? styles.paidText : styles.pendingText]}>
              {event.isPaid ? 'Pagado' : 'Pendiente'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppPress}>
          <Text style={styles.whatsappButtonText}>📱 WhatsApp</Text>
        </TouchableOpacity>
        
        {!event.isPaid && onMarkAsPaid && (
          <TouchableOpacity style={styles.payButton} onPress={onMarkAsPaid}>
            <Text style={styles.payButtonText}>✅ Marcar Pagado</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: colors.textLight,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    color: colors.textLight,
  },
  details: {
    marginBottom: 12,
  },
  packageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  package: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 12,
    color: colors.textLight,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  paidBadge: {
    backgroundColor: colors.success + '20',
  },
  pendingBadge: {
    backgroundColor: colors.warning + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidText: {
    color: colors.success,
  },
  pendingText: {
    color: colors.warning,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: '#25D366',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  whatsappButtonText: {
    color: colors.backgroundAlt,
    fontSize: 12,
    fontWeight: '600',
  },
  payButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: colors.backgroundAlt,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EventCard;
