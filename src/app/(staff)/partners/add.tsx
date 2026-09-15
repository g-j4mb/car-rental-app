import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { partnerSchema, type PartnerInput } from '../../../lib/validation';
import { useAddPartner } from '../../../hooks/usePartners';

export default function AddPartnerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const addPartner = useAddPartner();
  const [apiError, setApiError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PartnerInput>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { name: '', phone: '', commission_rate: 20, notes: '', login_email: '' },
  });

  const onSubmit = async (data: PartnerInput) => {
    setApiError(null);
    try {
      await addPartner.mutateAsync(data);
      reset(); // clear the form; this screen stays mounted in the Tabs navigator
      router.replace('/(staff)/partners');
    } catch (e: any) {
      setApiError(e?.message ?? t('common.error'));
    }
  };

  const renderField = (
    name: keyof PartnerInput,
    label: string,
    opts?: { numeric?: boolean; multiline?: boolean }
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value != null ? String(value) : ''}
            onChangeText={(text) =>
              onChange(opts?.numeric ? Number(text.replace(/[^0-9.]/g, '')) || 0 : text)
            }
            keyboardType={opts?.numeric ? 'numeric' : 'default'}
            multiline={opts?.multiline}
            style={[styles.input, opts?.multiline && styles.multiline, errors[name] && styles.inputError]}
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

      {renderField('name', t('partners.name'))}
      {renderField('phone', t('partners.phone'))}
      {renderField('commission_rate', t('partners.commission_rate'), { numeric: true })}
      {renderField('notes', t('partners.notes'), { multiline: true })}

      {renderField('login_email', t('partners.login_email'))}
      <Text style={styles.hint}>{t('partners.login_email_hint')}</Text>

      <TouchableOpacity
        style={[styles.submitBtn, addPartner.isPending && styles.submitBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={addPartner.isPending}
      >
        {addPartner.isPending && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
        <Text style={styles.submitText}>
          {addPartner.isPending ? t('common.saving') : t('partners.save_partner')}
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
  hint: { color: '#9CA3AF', fontSize: 12, marginTop: -8, marginBottom: 16 },
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
