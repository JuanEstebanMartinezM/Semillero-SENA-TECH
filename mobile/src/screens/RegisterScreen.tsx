/**
 * Pantalla de Registro para móvil.
 */

import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { authApi } from '../api/auth';
import type { RootStackParamList } from '../navigation';
import { handleApiError } from '../utils/errorHandler';
import { useAlert } from '../hooks/useAlert';

type RegisterScreenProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenProp>();
  const { alert, showAlert, hideAlert } = useAlert();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      showAlert('success', 'Registro completado correctamente');
      setTimeout(() => navigation.navigate('Login'), 2000);
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const { confirmPassword, ...data } = formData;
    registerMutation.mutate(data);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/davivienda.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Completa el formulario</Text>
          </View>

          {alert.visible && (
            <View style={styles.alertContainer}>
              <Alert type={alert.type} message={alert.message} onClose={hideAlert} />
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Usuario"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              error={errors.username}
              autoCapitalize="none"
            />

            <Input
              label="Nombre Completo"
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            />

            <Input
              label="Contraseña"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              error={errors.password}
              isPassword
            />

            <Input
              label="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              error={errors.confirmPassword}
              isPassword
            />

            <Button
              variant="primary"
              onPress={handleSubmit}
              isLoading={registerMutation.isPending}
              fullWidth
            >
              Registrarse
            </Button>

            <Button
              variant="ghost"
              onPress={() => navigation.navigate('Login')}
              fullWidth
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 80,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  alertContainer: {
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
});
