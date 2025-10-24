/**
 * Componente Alert para React Native.
 * Muestra mensajes de error/success/warning/info
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlertProps {
  readonly type: 'error' | 'success' | 'warning' | 'info';
  readonly message: string;
  readonly onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const iconNames: Record<string, keyof typeof Ionicons.glyphMap> = {
    error: 'alert-circle',
    success: 'checkmark-circle',
    warning: 'warning',
    info: 'information-circle',
  };

  const getIconColor = (alertType: string): string => {
    if (alertType === 'error') return '#991B1B';
    if (alertType === 'success') return '#065F46';
    if (alertType === 'warning') return '#92400E';
    return '#1E40AF';
  };

  const getBackgroundColor = (alertType: string): string => {
    if (alertType === 'error') return '#FEF2F2';
    if (alertType === 'success') return '#F0FDF4';
    if (alertType === 'warning') return '#FFFBEB';
    return '#EFF6FF';
  };

  const getBorderColor = (alertType: string): string => {
    if (alertType === 'error') return '#EF4444';
    if (alertType === 'success') return '#10B981';
    if (alertType === 'warning') return '#F59E0B';
    return '#3B82F6';
  };

  const getTextColor = (alertType: string): string => {
    if (alertType === 'error') return '#991B1B';
    if (alertType === 'success') return '#065F46';
    if (alertType === 'warning') return '#92400E';
    return '#1E40AF';
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: getBackgroundColor(type), borderLeftColor: getBorderColor(type) }
    ]}>
      <View style={styles.contentContainer}>
        <Ionicons name={iconNames[type]} size={20} color={getIconColor(type)} />
        <Text style={[styles.message, { color: getTextColor(type) }]}>{message}</Text>
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
