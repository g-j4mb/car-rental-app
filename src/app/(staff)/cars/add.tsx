import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { carSchema, type CarInput } from '../../../lib/validation';
import { useAddCar, usePartners } from '../../../hooks/useCars';

export default function AddCarScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const addCar = useAddCar();
  const { data: partners } = usePartners();
  const [apiError, setApiError] = useState<string | null>(null);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CarInput>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      plate_number: '',
      color: '',
      owner_type: 'company',
      partner_id: null,
    },
  });

  const ownerType = watch('owner_type');

  const onSubmit = async (data: CarInput) => {
    setApiError(null);
    try {
      await addCar.mutateAsync(data);
      reset(); // clear the form; this screen stays mounted in the Tabs navigator
      router.replace('/(staff)/cars');
    } catch (e: any) {
      setApiError(e?.message ?? t('common.error'));
    }
  };

  const renderField = (
    name: keyof CarInput,
    label: string,
    opts?: { keyboardType?: 'numeric' | 'default'; numeric?: boolean }
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value != null ? String(value) : ''}
            onChangeText={(text) => onChange(opts?.numeric ? Number(text.replace(/[^0-9]/g, '')) || 0 : text)}
            keyboardType={opts?.keyboardType ?? 'default'}
            style={[styles.input, errors[name] && styles.inputError]}
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

      {renderField('make', t('fleet.make'))}
      {renderField('model', t('fleet.model'))}
      {renderField('year', t('fleet.year'), { keyboardType: 'numeric', numeric: true })}
      {renderField('plate_number', t('fleet.plate'))}
      {renderField('color', t('fleet.color'))}

      {/* Owner type selector */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('fleet.owner')}</Text>
        <View style={styles.segment}>
          <TouchableOpacity
            style={[styles.segmentBtn, ownerType === 'company' && styles.segmentBtnActive]}
            onPress={() => { setValue('owner_type', 'company'); setValue('partner_id', null); }}
          >
            <Text style={[styles.segmentText, ownerType === 'company' && styles.segmentTextActive]}>
              {t('fleet.owner_company')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, ownerType === 'partner' && styles.segmentBtnActive]}
            onPress={() => setValue('owner_type', 'partner')}
          >
            <Text style={[styles.segmentText, ownerType === 'partner' && styles.segmentTextActive]}>
              {t('fleet.owner_partner')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Partner picker (only when owner is a partner) */}
      {ownerType === 'partner' && (
        <View style={styles.field}>
          <Text style={styles.label}>{t('fleet.select_partner')}</Text>
          <Controller
            control={control}
            name="partner_id"
            render={({ field: { value, onChange } }) => (
              <View>
                {(partners ?? []).map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.partnerRow, value === p.id && styles.partnerRowActive]}
                    onPress={() => onChange(p.id)}
                  >
                    <Text style={styles.partnerName}>{p.name}</Text>
                    {value === p.id && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                ))}
                {(partners ?? []).length === 0 && (
                  <Text style={styles.hint}>No partners available</Text>
                )}
              </View>
            )}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, addCar.isPending && styles.submitBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={addCar.isPending}
      >
        {addCar.isPending && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
        <Text style={styles.submitText}>
          {addCar.isPending ? t('common.saving') : t('fleet.save_car')}
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
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' },
  segmentBtnActive: { backgroundColor: '#2563EB' },
  segmentText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  segmentTextActive: { color: '#fff' },
  partnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  partnerRowActive: { borderColor: '#1F2937', backgroundColor: '#F3F4F6' },
  partnerName: { fontSize: 14, color: '#1F2937' },
  check: { color: '#10B981', fontWeight: 'bold' },
  hint: { color: '#9CA3AF', fontSize: 13 },
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
