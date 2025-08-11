
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: string;
}

export default function Button({ 
  text, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon
}: ButtonProps) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Add variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'accent':
        baseStyle.push(styles.accent);
        break;
      case 'success':
        baseStyle.push(styles.success);
        break;
      case 'warning':
        baseStyle.push(styles.warning);
        break;
      case 'danger':
        baseStyle.push(styles.danger);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      default:
        baseStyle.push(styles.primary);
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
      default:
        baseStyle.push(styles.medium);
    }
    
    // Add disabled style
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.buttonText];
    
    // Add variant text styles
    if (variant === 'outline') {
      baseTextStyle.push(styles.outlineText);
    } else {
      baseTextStyle.push(styles.defaultText);
    }
    
    // Add size text styles
    switch (size) {
      case 'small':
        baseTextStyle.push(styles.smallText);
        break;
      case 'large':
        baseTextStyle.push(styles.largeText);
        break;
      default:
        baseTextStyle.push(styles.mediumText);
    }
    
    // Add disabled text style
    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity 
      style={[...getButtonStyle(), style]} 
      onPress={onPress} 
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <Text style={[...getTextStyle(), textStyle]}>
        {icon && `${icon} `}{text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
  
  // Variant styles
  primary: {
    backgroundColor: colors.primary,
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.secondary,
    boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)',
    elevation: 4,
  },
  accent: {
    backgroundColor: colors.accent,
    boxShadow: '0 4px 12px rgba(69, 183, 209, 0.3)',
    elevation: 4,
  },
  success: {
    backgroundColor: colors.success,
    boxShadow: '0 4px 12px rgba(150, 206, 180, 0.3)',
    elevation: 4,
  },
  warning: {
    backgroundColor: colors.warning,
    boxShadow: '0 4px 12px rgba(255, 234, 167, 0.3)',
    elevation: 4,
  },
  danger: {
    backgroundColor: colors.danger,
    boxShadow: '0 4px 12px rgba(255, 118, 117, 0.3)',
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.2)',
    elevation: 2,
  },
  disabled: {
    backgroundColor: colors.lightGray,
    boxShadow: 'none',
    elevation: 0,
  },
  
  // Size styles
  small: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  
  // Text styles
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  defaultText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textMuted,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
