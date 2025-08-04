
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#4A90E2',      // Light blue
  secondary: '#FF6B35',    // Orange accent
  success: '#4CAF50',      // Green for available dates
  error: '#F44336',        // Red for booked dates
  warning: '#FFC107',      // Yellow highlight
  background: '#F8F9FA',   // Light background
  backgroundAlt: '#FFFFFF', // White cards
  text: '#2C3E50',         // Dark gray text
  textLight: '#7F8C8D',    // Light gray text
  border: '#E1E8ED',       // Light border
  card: '#FFFFFF',         // White card background
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  secondary: {
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    width: '100%',
  },
  success: {
    backgroundColor: colors.success,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.text,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 20,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  textLight: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.backgroundAlt,
    marginBottom: 16,
    color: colors.text,
  },
  picker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    marginBottom: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: colors.primary,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  navButtonTextActive: {
    color: colors.backgroundAlt,
  },
});
