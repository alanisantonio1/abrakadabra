
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#6366f1',      // Indigo
  secondary: '#8b5cf6',    // Purple
  accent: '#06b6d4',       // Cyan
  success: '#10b981',      // Emerald
  warning: '#f59e0b',      // Amber
  error: '#ef4444',        // Red
  info: '#3b82f6',         // Blue
  
  background: '#f8fafc',   // Slate 50
  surface: '#ffffff',      // White
  border: '#e2e8f0',       // Slate 200
  
  text: '#1e293b',         // Slate 800
  textSecondary: '#64748b', // Slate 500
  textLight: '#94a3b8',    // Slate 400
  
  // Event status colors
  available: '#10b981',    // Green
  occupied: '#ef4444',     // Red
  pending: '#f59e0b',      // Amber
  
  // Package colors
  abra: '#06b6d4',         // Cyan
  kadabra: '#8b5cf6',      // Purple
  abrakadabra: '#f59e0b',  // Amber
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  header: {
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  
  section: {
    padding: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    marginBottom: 12,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  
  successText: {
    color: colors.success,
    fontSize: 14,
    marginTop: 4,
  },
  
  warningText: {
    color: colors.warning,
    fontSize: 14,
    marginTop: 4,
  },
  
  // Form styles
  form: {
    padding: 16,
  },
  
  formGroup: {
    marginBottom: 16,
  },
  
  // Status indicators
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  
  // Calendar styles
  calendarContainer: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  calendarNavButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  
  calendarNavText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    margin: 1,
  },
  
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Event card styles
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  
  eventDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  
  eventDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  // Package card styles
  packageCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  
  packageSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  
  packageImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  
  packageDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  
  packagePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  modalText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  
  modalButtonSecondary: {
    backgroundColor: colors.border,
  },
  
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  modalButtonTextPrimary: {
    color: colors.surface,
  },
  
  modalButtonTextSecondary: {
    color: colors.text,
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
  },
  
  secondary: {
    backgroundColor: colors.secondary,
  },
  
  accent: {
    backgroundColor: colors.accent,
  },
  
  success: {
    backgroundColor: colors.success,
  },
  
  warning: {
    backgroundColor: colors.warning,
  },
  
  error: {
    backgroundColor: colors.error,
  },
  
  info: {
    backgroundColor: colors.info,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  outlineText: {
    color: colors.primary,
  },
  
  disabled: {
    backgroundColor: colors.border,
  },
  
  disabledText: {
    color: colors.textLight,
  },
});
