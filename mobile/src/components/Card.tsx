/**
 * Componente Card para React Native.
 * Contenedor con sombra y bordes redondeados.
 */

import { View, StyleSheet } from 'react-native';
import type { ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  readonly children: React.ReactNode;
}

export default function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
