
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Event } from '../types';
import { colors, commonStyles } from '../styles/commonStyles';
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
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardPaid: {
    borderLeftColor: colors.success,
  },
  cardPending: {
    borderLeftColor: colors.warning,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  statusPaid: {
    backgroundColor: colors.success,
  },
  statusPending: {
    backgroundColor: colors.warning,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  anticiposSection: {
    backgroundColor: colors.lightGray,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  anticiposTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  anticipoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  anticipoLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  anticipoValue: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  whatsappButton: {
    backgroundColor: colors.success,
  },
  paidButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

const EventCard: React.FC<EventCardProps> = ({ event, onPress, onMarkAsPaid }) => {
  const handleWhatsAppPress = () => {
    try {
      console.log('📱 Sending WhatsApp reminder from EventCard:', event.id);
      sendWhatsAppReminder(event);
    } catch (error: any) {
      console.error('❌ Error sending WhatsApp reminder:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString: string): string => {
    return timeString;
  };

  const totalAnticipos = (event.anticipo1Amount || 0) + (event.anticipo2Amount || 0) + (event.anticipo3Amount || 0);
  const anticiposCount = [
    event.anticipo1Amount || 0,
    event.anticipo2Amount || 0,
    event.anticipo3Amount || 0
  ].filter(amount => amount > 0).length;

  return (
    <View style={[
      styles.card,
      event.isPaid ? styles.cardPaid : styles.cardPending
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.childName}>{event.childName}</Text>
        <Text style={[
          styles.status,
          event.isPaid ? styles.statusPaid : styles.statusPending
        ]}>
          {event.isPaid ? '✅ PAGADO' : '⏳ PENDIENTE'}
        </Text>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cliente:</Text>
          <Text style={styles.detailValue}>{event.customerName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha:</Text>
          <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hora:</Text>
          <Text style={styles.detailValue}>{formatTime(event.time)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Paquete:</Text>
          <Text style={styles.detailValue}>{event.packageType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total:</Text>
          <Text style={styles.detailValue}>${event.totalAmount.toLocaleString()}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Saldo:</Text>
          <Text style={[
            styles.detailValue,
            { color: event.remainingAmount > 0 ? colors.warning : colors.success }
          ]}>
            ${event.remainingAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Anticipos Section */}
      {anticiposCount > 0 && (
        <View style={styles.anticiposSection}>
          <Text style={styles.anticiposTitle}>
            Anticipos ({anticiposCount}/3) - Total: ${totalAnticipos.toLocaleString()}
          </Text>
          
          {(event.anticipo1Amount || 0) > 0 && (
            <View style={styles.anticipoRow}>
              <Text style={styles.anticipoLabel}>Anticipo 1:</Text>
              <Text style={styles.anticipoValue}>${(event.anticipo1Amount || 0).toLocaleString()}</Text>
            </View>
          )}
          
          {(event.anticipo2Amount || 0) > 0 && (
            <View style={styles.anticipoRow}>
              <Text style={styles.anticipoLabel}>Anticipo 2:</Text>
              <Text style={styles.anticipoValue}>${(event.anticipo2Amount || 0).toLocaleString()}</Text>
            </View>
          )}
          
          {(event.anticipo3Amount || 0) > 0 && (
            <View style={styles.anticipoRow}>
              <Text style={styles.anticipoLabel}>Anticipo 3:</Text>
              <Text style={styles.anticipoValue}>${(event.anticipo3Amount || 0).toLocaleString()}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.whatsappButton]}
          onPress={handleWhatsAppPress}
        >
          <Text style={styles.actionButtonText}>📱 WhatsApp</Text>
        </TouchableOpacity>
        
        {!event.isPaid && onMarkAsPaid && (
          <TouchableOpacity
            style={[styles.actionButton, styles.paidButton]}
            onPress={onMarkAsPaid}
          >
            <Text style={styles.actionButtonText}>💰 Pagado</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default EventCard;
