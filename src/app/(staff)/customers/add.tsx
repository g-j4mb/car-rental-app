import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { customerSchema, type CustomerInput } from '../../../lib/validation';
import { useAddCustomer } from '../../../hooks/useCustomers';

export default function AddCustomerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const addCustomer = useAddCustomer();
  const [apiError, setApiError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { full_name: '', phone: '', id_number: '', license_number: '', notes: '' },
  });

  const onSubmit = async (data: CustomerInput) => {
    setApiError(null);
    try {
      await addCustomer.mutateAsync(data);
      reset(); // clear the form; this screen stays mounted in the Tabs navigator
      router.replace('/(staff)/customers');
    } catch (e: any) {
      setApiError(e?.message ?? t('common.error'));
    }
  };

  const renderField = (name: keyof CustomerInput, label: string, multiline?: boolean) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value ?? ''}
            onChangeText={onChange}
            multiline={multiline}
            style={[styles.input, multiline && styles.multiline, errors[name] && styles.inputError]}
          />
          {errors[name] && <Text style={styles.fieldError}>{String(errors[name]?.message)}</Text>}
        </View>
      )}
    />
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {apiError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{apiError}</Text>
        </View>
      )}

      {renderField('full_name', t('customers.full_name'))}
      {renderField('phone', t('customers.phone'))}
      {renderField('id_number', t('customers.id_number'))}
      {renderField('license_number', t('customers.license_number'))}
      {renderField('notes', t('customers.notes'), true)}

      <TouchableOpacity
        style={[styles.submitBtn, addCustomer.isPending && styles.submitBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={addCustomer.isPending}
      >
        {addCustomer.isPending && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
        <Text style={styles.submitText}>
          {addCustomer.isPending ? t('common.saving') : t('customers.save_customer')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 15 },
  multiline: { height: 90, textAlignVertical: 'top' },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  errorBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorBoxText: { color: '#DC2626', fontSize: 13 },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { backgroundColor: '#9CA3AF' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
