/**
 * Modal para crear/editar tareas.
 */

import { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import Input from './Input';
import Button from './Button';
import { TaskPriority } from '../types';
import type { Task } from '../types';

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: Task;
}

export interface TaskFormData {
  title: string;
  description?: string;
  category?: string;
  priority: number;
  due_date?: string;
}

export default function TaskFormModal({ 
  visible, 
  onClose, 
  onSubmit, 
  isLoading,
  mode = 'create',
  initialData 
}: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: '',
    priority: TaskPriority.MEDIUM,
    due_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Cargar datos iniciales cuando se edita
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        category: initialData.category || '',
        priority: initialData.priority,
        due_date: initialData.due_date || '',
      });
      if (initialData.due_date) {
        setSelectedDate(new Date(initialData.due_date));
      }
    }
  }, [mode, initialData, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('=================================');
    console.log('🔘 Botón de guardar presionado');
    console.log('📝 Título:', formData.title);
    console.log('📝 Descripción:', formData.description);
    console.log('📝 Categoría:', formData.category);
    console.log('📝 Prioridad:', formData.priority);
    console.log('📝 Fecha:', formData.due_date);
    console.log('=================================');
    
    if (!validate()) {
      console.log('❌ Validación falló - título vacío');
      return;
    }
    
    console.log('✅ Validación exitosa, llamando onSubmit...');
    onSubmit(formData);
    console.log('✅ onSubmit llamado');
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: TaskPriority.MEDIUM,
      due_date: '',
    });
    setErrors({});
    setShowDatePicker(false);
    setSelectedDate(new Date());
    onClose();
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      // Formatear fecha como YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({ ...formData, due_date: formattedDate });
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalWrapper}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {mode === 'edit' ? 'Editar Tarea' : 'Nueva Tarea'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Contenido scrolleable */}
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
            <Input
              label="Título"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              error={errors.title}
              placeholder="Nombre de la tarea"
            />

            <Input
              label="Descripción"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Descripción detallada"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Categoría"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholder="Ej: Trabajo, Personal"
            />

            <View style={styles.field}>
              <Text style={styles.label}>Prioridad</Text>
              <View style={styles.priorityContainer}>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    formData.priority === TaskPriority.LOW && styles.priorityButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, priority: TaskPriority.LOW })}
                >
                  <Text style={styles.priorityText}>Baja</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    formData.priority === TaskPriority.MEDIUM && styles.priorityButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, priority: TaskPriority.MEDIUM })}
                >
                  <Text style={styles.priorityText}>Media</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    formData.priority === TaskPriority.HIGH && styles.priorityButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, priority: TaskPriority.HIGH })}
                >
                  <Text style={styles.priorityText}>Alta</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Fecha límite (opcional)</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.dateButtonText}>
                  {formData.due_date ? formatDisplayDate(formData.due_date) : 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>
              {formData.due_date && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={() => setFormData({ ...formData, due_date: '' })}
                >
                  <Text style={styles.clearDateText}>Limpiar fecha</Text>
                </TouchableOpacity>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {Platform.OS === 'ios' && showDatePicker && (
              <View style={styles.iosDatePickerButtons}>
                <Button 
                  variant="secondary" 
                  onPress={() => setShowDatePicker(false)}
                >
                  Cerrar
                </Button>
              </View>
            )}
            </ScrollView>

            {/* Footer fijo con botones */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Guardando...' : mode === 'edit' ? 'Guardar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modal: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  priorityButtonActive: {
    borderColor: '#ED1C24',
    backgroundColor: '#FEE2E2',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ED1C24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    fontSize: 14,
    color: '#EF4444',
  },
  iosDatePickerButtons: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
