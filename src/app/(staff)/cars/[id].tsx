import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { carEditSchema, type CarEditInput } from '../../../lib/validation';
import { useCar, useUpdateCar, usePartners } from '../../../hooks/useCars';

// 'rented' is system-managed (set automatically while a rental is active), so
// it's not manually selectable — only these are.
const MANUAL_STATUSES: Array<'available' | 'maintenance'> = ['available', 'maintenance'];

export default function EditCarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: car, isLoading } = useCar(id);
  const updateCar = useUpdateCar(id);
  const { data: partners } = usePartners();
  const [apiError, setApiError] = useState<string | null>(null);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CarEditInput>({
    resolver: zodResolver(carEditSchema),
    defaultValues: {
      make: '', model: '', year: new Date().getFullYear(),
      plate_number: '', color: '', owner_type: 'company',
      partner_id: null, status: 'available',
    },
  });

  // Populate the form once the car loads
  useEffect(() => {
    if (car) {
      reset({
        make: car.make,
        model: car.model,
        year: car.year,
        plate_number: car.plate_number,
        color: car.color,
        owner_type: car.owner_type,
        partner_id: car.partner_id ?? null,
        status: (car.status === 'inactive' ? 'available' : car.status) as CarEditInput['status'],
      });
    }
  }, [car]);

  const ownerType = watch('owner_type');
  const status = watch('status');

  const onSubmit = async (data: CarEditInput) => {
    setApiError(null);
    try {
      await updateCar.mutateAsync(data);
      router.replace('/(staff)/cars');
    } catch (e: any) {
      setApiError(e?.message ?? t('common.error'));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const renderField = (
    name: keyof CarEditInput,
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

      {/* Status selector — 'rented' is read-only (driven by active rentals) */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('fleet.status')}</Text>
        {status === 'rented' ? (
          <View style={styles.readonlyStatus}>
            <Text style={styles.readonlyStatusText}>{t('car_status.rented')}</Text>
            <Text style={styles.readonlyHint}>{t('fleet.status_auto_hint')}</Text>
          </View>
        ) : (
          <View style={styles.segment}>
            {MANUAL_STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.segmentBtn, status === s && styles.segmentBtnActive]}
                onPress={() => setValue('status', s)}
              >
                <Text style={[styles.segmentText, status === s && styles.segmentTextActive]}>
                  {t(`car_status.${s}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

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
              </View>
            )}
          />
          {errors.partner_id && <Text style={styles.fieldError}>{String(errors.partner_id.message)}</Text>}
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, updateCar.isPending && styles.submitBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={updateCar.isPending}
      >
        {updateCar.isPending && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
        <Text style={styles.submitText}>
          {updateCar.isPending ? t('common.saving') : t('fleet.save_changes')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 15 },
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
  segmentText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  segmentTextActive: { color: '#fff' },
  readonlyStatus: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
  },
  readonlyStatusText: { fontSize: 14, fontWeight: '600', color: '#F59E0B' },
  readonlyHint: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
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
