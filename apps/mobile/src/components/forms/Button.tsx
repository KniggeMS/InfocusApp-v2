import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  testID,
  style,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'danger':
        return styles.dangerText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), (disabled || loading) && styles.disabled, style]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dangerButton: {
    alignItems: 'center',
    backgroundColor: colors.slate[500],
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dangerText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  outlineButton: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    borderColor: colors.gray[500],
    borderRadius: 6,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  outlineText: {
    color: colors.gray[500],
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.blue[500],
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.transparent,
    borderColor: colors.blue[500],
    borderRadius: 6,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryText: {
    color: colors.blue[500],
    fontSize: 16,
    fontWeight: '600',
  },
});
