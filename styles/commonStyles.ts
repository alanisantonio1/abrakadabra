
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#FF6B6B',        // Vibrant coral red - main brand color
  secondary: '#4ECDC4',      // Turquoise - secondary actions
  accent: '#45B7D1',         // Sky blue - accents and info
  success: '#96CEB4',        // Mint green - success states
  warning: '#FFEAA7',        // Soft yellow - warnings
  danger: '#FF7675',         // Light red - errors/danger
  info: '#74B9FF',           // Light blue - information
  background: '#F8F9FA',     // Very light gray - app background
  cardBackground: '#FFFFFF', // Pure white - card backgrounds
  text: '#2D3436',           // Dark gray - primary text
  textLight: '#636E72',      // Medium gray - secondary text
  textMuted: '#B2BEC3',      // Light gray - muted text
  border: '#DDD6FE',         // Light purple - borders
  lightGray: '#F1F3F4',      // Very light gray - disabled states
  white: '#FFFFFF',          // Pure white
  shadow: '#000000',         // Black for shadows
  
  // Calendar specific colors
  available: '#4CAF50',      // Green for available dates
  occupied: '#F44336',       // Red for occupied dates
  selected: '#FF6B6B',       // Primary color for selected
  today: '#45B7D1',          // Accent color for today
  past: '#E0E0E0',           // Gray for past dates
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    elevation: 4,
    minHeight: 52,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 1,
    boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)',
    elevation: 3,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
    fontStyle: 'italic',
  },
  shadow: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  // Enhanced styles for better UI
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    fontWeight: '500',
  },
  quickActions: {
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quickActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: colors.lightGray,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  selectedDateContainer: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    elevation: 4,
  },
  selectedDateText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  toolButton: {
    backgroundColor: colors.secondary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)',
    elevation: 4,
  },
  toolButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: colors.lightGray,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)',
    elevation: 4,
  },
  accent: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(69, 183, 209, 0.3)',
    elevation: 4,
  },
  success: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(150, 206, 180, 0.3)',
    elevation: 4,
  },
  warning: {
    backgroundColor: colors.warning,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(255, 234, 167, 0.3)',
    elevation: 4,
  },
  danger: {
    backgroundColor: colors.danger,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(255, 118, 117, 0.3)',
    elevation: 4,
  },
  info: {
    backgroundColor: colors.info,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(116, 185, 255, 0.3)',
    elevation: 4,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  small: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  smallText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  large: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  largeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
