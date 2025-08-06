
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  paidCard: {
    borderLeftColor: colors.success,
  },
  pendingCard: {
    borderLeftColor: colors.warning,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  paidBadge: {
    backgroundColor: colors.success,
  },
  pendingBadge: {
    backgroundColor: colors.warning,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  packageType: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  paymentInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  paymentLabel: {
    fontSize: 13,
    color: colors.gray,
  },
  paymentValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  remainingAmount: {
    color: colors.warning,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  whatsappButton: {
    backgroundColor: colors.success,
  },
  markPaidButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  notes: {
    marginTop: 8,
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
});

const EventCard: React.FC<EventCardProps> = ({ event, onPress, onMarkAsPaid }) => {
  const handleWhatsAppPress = async () => {
    try {
      console.log('📱 Sending WhatsApp reminder for event:', event.id);
      await sendWhatsAppReminder(event);
    } catch (error: any) {
      console.error('❌ Error sending WhatsApp reminder:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString: string): string => {
    try {
      // Assuming time is in HH:MM format
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        event.isPaid ? styles.paidCard : styles.pendingCard
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.childName}>{event.childName}</Text>
        <View style={[
          styles.statusBadge,
          event.isPaid ? styles.paidBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>
            {event.isPaid ? 'PAGADO' : 'PENDIENTE'}
          </Text>
        </View>
      </View>

      {/* Event Information */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Fecha:</Text>
        <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Hora:</Text>
        <Text style={styles.infoValue}>{formatTime(event.time)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Cliente:</Text>
        <Text style={styles.infoValue}>{event.customerName}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Teléfono:</Text>
        <Text style={styles.infoValue}>{event.customerPhone}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Paquete:</Text>
        <Text style={[styles.infoValue, styles.packageType]}>{event.packageType}</Text>
      </View>

      {/* Payment Information */}
      <View style={styles.paymentInfo}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Total:</Text>
          <Text style={styles.paymentValue}>${event.totalAmount.toLocaleString()}</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Anticipo:</Text>
          <Text style={styles.paymentValue}>${event.deposit.toLocaleString()}</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Saldo:</Text>
          <Text style={[
            styles.paymentValue,
            event.remainingAmount > 0 && styles.remainingAmount
          ]}>
            ${event.remainingAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {event.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {event.notes}
        </Text>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.whatsappButton]}
          onPress={handleWhatsAppPress}
        >
          <Text style={styles.actionButtonText}>📱 WhatsApp</Text>
        </TouchableOpacity>
        
        {!event.isPaid && onMarkAsPaid && (
          <TouchableOpacity
            style={[styles.actionButton, styles.markPaidButton]}
            onPress={onMarkAsPaid}
          >
            <Text style={styles.actionButtonText}>💰 Marcar Pagado</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;
