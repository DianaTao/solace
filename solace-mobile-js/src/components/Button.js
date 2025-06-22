import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../styles/commonStyles';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  ...props 
}) => {
  const buttonStyles = [
    styles.button,
    styles[size],
    variant === 'secondary' && styles.secondary,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    variant === 'secondary' && styles.secondaryText,
    disabled && styles.disabledText,
    textStyle,
  ];

  const gradientColors = variant === 'primary' 
    ? [colors.primary, colors.primaryDark]
    : [colors.gray[200], colors.gray[300]];

  return (
    <LinearGradient
      colors={gradientColors}
      style={buttonStyles}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        <Text style={textStyles}>{title}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  touchable: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  text: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  
  // Size variants
  small: {
    minHeight: 40,
  },
  medium: {
    minHeight: 48,
  },
  large: {
    minHeight: 56,
  },
  
  smallText: {
    fontSize: typography.sizes.sm,
  },
  mediumText: {
    fontSize: typography.sizes.md,
  },
  largeText: {
    fontSize: typography.sizes.lg,
  },
  
  // Variants
  secondary: {
    backgroundColor: colors.gray[200],
  },
  secondaryText: {
    color: colors.gray[700],
  },
  
  // States
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
}); 