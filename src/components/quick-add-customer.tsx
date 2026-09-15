import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { customerSchema, type CustomerInput } from '../lib/validation';
import { useAddCustomer } from '../hooks/useCustomers';
import type { Customer } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
  initialName?: string;
}

// Inline "add new customer" used from the rental flow, so staff don't have to
// leave the form to register a walk-in. On success the new customer is handed
// back to the caller (which selects it).
export function QuickAddCustomer({ visible, onClose, onCreated, initialName }: Props) {
  const { t } = useTranslation();
  const addCustomer = useAddCustomer();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: initialName ?? '',
      phone: '',
      id_number: '',
      license_number: '',
      notes: '',
    },
  });

  const onSubmit = async (data: CustomerInput) => {
    setApiError(null);
    try {
      const created = await addCustomer.mutateAsync(data);
      reset();
      onCreated(created);
    } catch (e: any) {
      setApiError(e?.message ?? t('common.error'));
    }
  };

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  const renderField = (name: keyof CustomerInput, label: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value ?? ''}
            onChangeText={onChange}
            style={[styles.input, errors[name] && styles.inputError]}
          />
          {errors[name] && <Text style={styles.fieldError}>{String(errors[name]?.message)}</Text>}
        </View>
      )}
    />
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('customers.add_customer')}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            {apiError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{apiError}</Text>
              </View>
            )}
            {renderField('full_name', t('customers.full_name'))}
            {renderField('phone', t('customers.phone'))}
            {renderField('id_number', t('customers.id_number'))}
            {renderField('license_number', t('customers.license_number'))}

            <TouchableOpacity
              style={[styles.submitBtn, addCustomer.isPending && styles.submitBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={addCustomer.isPending}
            >
              {addCustomer.isPending && (
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.submitText}>
                {addCustomer.isPending ? t('common.saving') : t('customers.save_customer')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  closeText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 15 },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  errorBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 14 },
  errorBoxText: { color: '#DC2626', fontSize: 13 },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { backgroundColor: '#9CA3AF' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
