/**
 * Pantalla de Login para móvil.
 */

import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { authApi } from '../api/auth';
import type { RootStackParamList } from '../navigation';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/errorHandler';
import { useAlert } from '../hooks/useAlert';

type LoginScreenProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenProp>();
  const { alert, showAlert, hideAlert } = useAlert();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      console.log('✅ Login exitoso');
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      await useAuthStore.getState().checkAuth();
      showAlert('success', 'Sesión iniciada correctamente');
    },
    onError: (error: any) => {
      console.log('❌ Error de login:', error.response?.data || error.message);
      const apiError = handleApiError(error);
      showAlert('error', apiError.message);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log('📤 Intentando login con:', formData.username);
    loginMutation.mutate(formData);
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
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
          </View>

          {alert.visible && (
            <View style={styles.alertContainer}>
              <Alert type={alert.type} message={alert.message} onClose={hideAlert} />
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Usuario"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Contraseña"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              error={errors.password}
              isPassword
            />

            <Button
              variant="primary"
              onPress={handleSubmit}
              isLoading={loginMutation.isPending}
              fullWidth
            >
              Iniciar Sesión
            </Button>

            <Button
              variant="ghost"
              onPress={() => navigation.navigate('Register')}
              fullWidth
            >
              ¿No tienes cuenta? Regístrate
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
    marginBottom: 32,
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
