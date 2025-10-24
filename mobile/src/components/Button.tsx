/**
 * Componente Button para React Native.
 * Variantes: primary, secondary, danger, ghost
 */

import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  readonly isLoading?: boolean;
  readonly fullWidth?: boolean;
  readonly children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[variant],
    fullWidth && styles.fullWidth,
    (disabled || isLoading) && styles.disabled,
  ];

  const textColor = variant === 'secondary' ? '#1F2937' : variant === 'ghost' ? '#374151' : '#FFFFFF';

  const handlePress = (e: any) => {
    console.log('👆 Botón presionado:', children);
    if (props.onPress) {
      props.onPress(e);
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
      onPress={handlePress}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={textColor} />
          <Text style={[styles.text, { color: textColor }]}>Cargando...</Text>
        </View>
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#ED1C24',
  },
  secondary: {
    backgroundColor: '#E5E7EB',
  },
  danger: {
    backgroundColor: '#DC2626',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
