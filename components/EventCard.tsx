
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Event } from '../types';
import { colors, commonStyles } from '../styles/commonStyles';
import { sendWhatsAppReminder, calculateEventCost } from '../utils/whatsapp';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onMarkAsPaid?: () => void;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
    elevation: 8,
    borderLeftWidth: 6,
  },
  cardPaid: {
    borderLeftColor: colors.success,
    backgroundColor: '#F8FFF9', // Very light green tint
  },
  cardPending: {
    borderLeftColor: colors.warning,
    backgroundColor: '#FFFEF8', // Very light yellow tint
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  childName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  statusPaid: {
    backgroundColor: colors.success,
  },
  statusPending: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  details: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: colors.success,
  },
  negativeAmount: {
    color: colors.danger,
  },
  anticipoSection: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  anticipoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  anticipoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  anticipoLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  anticipoValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  primaryAction: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    elevation: 4,
  },
  viewButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  whatsappButton: {
    backgroundColor: colors.success,
    boxShadow: '0 4px 12px rgba(150, 206, 180, 0.3)',
    elevation: 4,
  },
  paidButton: {
    backgroundColor: colors.accent,
    boxShadow: '0 4px 12px rgba(69, 183, 209, 0.3)',
    elevation: 4,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconText: {
    fontSize: 16,
  },
});

const EventCard: React.FC<EventCardProps> = ({ event, onPress, onMarkAsPaid }) => {
  const handleWhatsAppPress = async () => {
    try {
      console.log('📱 Sending WhatsApp reminder from EventCard:', event.id);
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

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  // UPDATED: Calculate correct pricing based on package type and date
  const getCorrectPricing = () => {
    const correctCost = calculateEventCost(event.date, event.packageType);
    const actualTotal = correctCost > 0 ? correctCost : event.totalAmount;
    const anticipoPaid = event.anticipo1Amount || event.deposit || 0;
    const actualRemaining = actualTotal - anticipoPaid;
    
    return {
      total: actualTotal,
      remaining: actualRemaining
    };
  };

  const pricing = getCorrectPricing();
  
  // Calculate anticipo information
  const anticipoAmount = event.anticipo1Amount || event.deposit || 0;
  const hasAnticipo = anticipoAmount > 0;

  return (
    <View style={[
      styles.card,
      event.isPaid ? styles.cardPaid : styles.cardPending
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.childName}>🎈 {event.childName}</Text>
        <View style={[
          styles.statusBadge,
          event.isPaid ? styles.statusPaid : styles.statusPending
        ]}>
          <Text style={styles.statusText}>
            {event.isPaid ? '✅ PAGADO' : '⏳ PENDIENTE'}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>👤 Cliente:</Text>
          <Text style={styles.detailValue}>{event.customerName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Fecha:</Text>
          <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🕐 Hora:</Text>
          <Text style={styles.detailValue}>{formatTime(event.time)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📦 Paquete:</Text>
          <Text style={styles.detailValue}>{event.packageType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>💰 Total:</Text>
          <Text style={[styles.detailValue, styles.amountValue]}>
            {formatCurrency(pricing.total)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>💵 Saldo:</Text>
          <Text style={[
            styles.detailValue, 
            styles.amountValue,
            pricing.remaining > 0 ? styles.negativeAmount : styles.positiveAmount
          ]}>
            {formatCurrency(pricing.remaining)}
          </Text>
        </View>
      </View>

      {/* Anticipo Section */}
      {hasAnticipo && (
        <View style={styles.anticipoSection}>
          <Text style={styles.anticipoTitle}>
            💳 Anticipo Registrado
          </Text>
          
          <View style={styles.anticipoRow}>
            <Text style={styles.anticipoLabel}>Monto del anticipo:</Text>
            <Text style={styles.anticipoValue}>
              {formatCurrency(anticipoAmount)}
            </Text>
          </View>
          
          {event.anticipo1Date && (
            <View style={styles.anticipoRow}>
              <Text style={styles.anticipoLabel}>Fecha de pago:</Text>
              <Text style={styles.anticipoValue}>
                {formatDate(event.anticipo1Date)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {/* Primary Action */}
        <View style={styles.primaryAction}>
          <TouchableOpacity style={styles.viewButton} onPress={onPress}>
            <Text style={styles.viewButtonText}>
              <Text style={styles.iconText}>👁️</Text> Ver Detalles
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.whatsappButton]}
            onPress={handleWhatsAppPress}
          >
            <Text style={styles.actionButtonText}>
              <Text style={styles.iconText}>📱</Text>{'\n'}WhatsApp
            </Text>
          </TouchableOpacity>
          
          {!event.isPaid && onMarkAsPaid && (
            <TouchableOpacity
              style={[styles.actionButton, styles.paidButton]}
              onPress={onMarkAsPaid}
            >
              <Text style={styles.actionButtonText}>
                <Text style={styles.iconText}>💰</Text>{'\n'}Marcar Pagado
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default EventCard;
