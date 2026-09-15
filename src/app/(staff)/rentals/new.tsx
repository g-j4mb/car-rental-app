import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  rentalCreateSchema,
  type RentalCreateInput,
  type RentalCreateFormInput,
} from '../../../lib/validation';
import { useAddRental } from '../../../hooks/useRentals';
import { useCustomers } from '../../../hooks/useCustomers';
import { useCars } from '../../../hooks/useCars';
import { calculateRentalAmount } from '../../../lib/financial';
import { formatCurrency, getDayCount } from '../../../lib/formatters';
import { todayISO, addDurationISO, nowHM } from '../../../lib/dates';
import { SearchablePicker, type PickerOption } from '../../../components/searchable-picker';
import { QuickAddCustomer } from '../../../components/quick-add-customer';
import type { Customer } from '../../../types';

const RENTAL_TYPES: Array<'daily' | 'weekly' | 'monthly' | 'yearly'> = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
];

const isoOk = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

// Built fresh each time so the start/end dates reflect "today" on every reset.
const makeDefaults = (): RentalCreateFormInput => ({
  customer_id: '',
  car_id: '',
  start_date: todayISO(),
  end_date: addDurationISO(todayISO(), 1, 'daily'),
  start_time: nowHM(),
  end_time: nowHM(),
  rental_type: 'daily',
  duration_qty: 1,
  daily_rate: 0,
  deposit_amount: 0,
  notes: '',
});

export default function NewRentalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const addRental = useAddRental();
  const { data: customers } = useCustomers();
  const { data: cars } = useCars();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  // Customers created inline are kept here so they appear/stay selected
  // immediately, before the customers query refetch lands.
  const [extraCustomers, setExtraCustomers] = useState<Customer[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RentalCreateFormInput, any, RentalCreateInput>({
    resolver: zodResolver(rentalCreateSchema),
    defaultValues: makeDefaults(),
  });

  const customerId = watch('customer_id');
  const carId = watch('car_id');
  const rentalType = watch('rental_type');
  const durationQty = watch('duration_qty');
  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const dailyRate = watch('daily_rate');

  // Auto-fill the end date from start + duration + unit. Editing the end date
  // directly is preserved until the start/duration/unit changes again.
  useEffect(() => {
    if (!isoOk(startDate)) return;
    const qty = Number(durationQty) || 1;
    setValue('end_date', addDurationISO(startDate, qty, rentalType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, durationQty, rentalType]);

  const customerOptions: PickerOption[] = useMemo(() => {
    const map = new Map<string, PickerOption>();
    [...(customers ?? []), ...extraCustomers].forEach((c) =>
      map.set(c.id, { id: c.id, label: c.full_name, sublabel: c.phone })
    );
    return Array.from(map.values());
  }, [customers, extraCustomers]);

  const carOptions: PickerOption[] = useMemo(
    () =>
      (cars ?? []).map((car) => ({
        id: car.id,
        label: `${car.make} ${car.model}`,
        sublabel: car.plate_number,
      })),
    [cars]
  );

  const datesValid = isoOk(startDate) && isoOk(endDate) && endDate > startDate;
  const days = datesValid ? getDayCount(startDate, endDate) : 0;
  const previewTotal = datesValid
    ? calculateRentalAmount(Number(dailyRate) || 0, startDate, endDate)
    : 0;

  const onSubmit = async (data: RentalCreateInput) => {
    setApiError(null);
    try {
      await addRental.mutateAsync(data);
      // Clear the form (this screen stays mounted in the Tabs navigator).
      reset(makeDefaults());
      setExtraCustomers([]);
      router.replace('/(staff)/rentals');
    } catch (e: any) {
      const code = e?.message;
      if (code === 'CAR_UNAVAILABLE') setApiError(t('rentals.error_car_unavailable'));
      else setApiError(code ?? t('common.error'));
    }
  };

  const renderDateField = (name: 'start_date' | 'end_date', label: string, hint?: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            style={[styles.input, errors[name] && styles.inputError]}
          />
          {hint && !errors[name] && <Text style={styles.hint}>{hint}</Text>}
          {errors[name] && <Text style={styles.fieldError}>{String(errors[name]?.message)}</Text>}
        </View>
      )}
    />
  );

  const renderTimeField = (name: 'start_time' | 'end_time', label: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value ?? ''}
            onChangeText={onChange}
            placeholder="HH:MM"
            autoCapitalize="none"
            style={[styles.input, errors[name] && styles.inputError]}
          />
          {errors[name] && <Text style={styles.fieldError}>{String(errors[name]?.message)}</Text>}
        </View>
      )}
    />
  );

  const renderMoneyField = (name: 'daily_rate' | 'deposit_amount', label: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value != null ? String(value) : ''}
            onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, '') as any)}
            keyboardType="numeric"
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

      <SearchablePicker
        label={t('rentals.select_customer')}
        placeholder={t('rentals.select_customer')}
        searchPlaceholder={t('rentals.search_customer')}
        value={customerId}
        options={customerOptions}
        onSelect={(id) => setValue('customer_id', id, { shouldValidate: true })}
        onAddNew={() => setShowAddCustomer(true)}
        addNewLabel={t('rentals.add_new_customer')}
        emptyText={t('customers.no_customers')}
        error={errors.customer_id ? String(errors.customer_id.message) : undefined}
      />

      <SearchablePicker
        label={t('rentals.select_car')}
        placeholder={t('rentals.select_car')}
        searchPlaceholder={t('rentals.search_car')}
        value={carId}
        options={carOptions}
        onSelect={(id) => setValue('car_id', id, { shouldValidate: true })}
        emptyText={t('rentals.no_available_cars')}
        error={errors.car_id ? String(errors.car_id.message) : undefined}
      />

      {/* Rental unit + quantity drive the auto end date */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('rentals.rental_type')}</Text>
        <View style={styles.segment}>
          {RENTAL_TYPES.map((rt) => (
            <TouchableOpacity
              key={rt}
              style={[styles.segmentBtn, rentalType === rt && styles.segmentBtnActive]}
              onPress={() => setValue('rental_type', rt)}
            >
              <Text style={[styles.segmentText, rentalType === rt && styles.segmentTextActive]}>
                {t(`rentals.type_${rt}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Controller
        control={control}
        name="duration_qty"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>{t('rentals.quantity')}</Text>
            <TextInput
              value={value != null ? String(value) : ''}
              onChangeText={(text) => onChange((text.replace(/[^0-9]/g, '') || '') as any)}
              keyboardType="numeric"
              style={[styles.input, errors.duration_qty && styles.inputError]}
            />
            {errors.duration_qty && (
              <Text style={styles.fieldError}>{String(errors.duration_qty.message)}</Text>
            )}
          </View>
        )}
      />

      <View style={styles.dtRow}>
        <View style={styles.dtDate}>{renderDateField('start_date', t('rentals.start_date'))}</View>
        <View style={styles.dtTime}>{renderTimeField('start_time', t('rentals.start_time'))}</View>
      </View>
      <View style={styles.dtRow}>
        <View style={styles.dtDate}>{renderDateField('end_date', t('rentals.end_date'), t('rentals.auto_end_hint'))}</View>
        <View style={styles.dtTime}>{renderTimeField('end_time', t('rentals.end_time'))}</View>
      </View>

      {renderMoneyField('daily_rate', t('rentals.daily_rate'))}
      {renderMoneyField('deposit_amount', t('rentals.deposit'))}

      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>{t('rentals.notes')}</Text>
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              multiline
              style={[styles.input, styles.textArea]}
            />
          </View>
        )}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('rentals.duration')}</Text>
          <Text style={styles.summaryValue}>{t('rentals.days', { count: days })}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('rentals.estimated_total')}</Text>
          <Text style={styles.summaryTotal}>{formatCurrency(previewTotal)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, addRental.isPending && styles.submitBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={addRental.isPending}
      >
        {addRental.isPending && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
        <Text style={styles.submitText}>
          {addRental.isPending ? t('common.saving') : t('rentals.create_rental')}
        </Text>
      </TouchableOpacity>

      <QuickAddCustomer
        visible={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCreated={(customer) => {
          setExtraCustomers((prev) => [customer, ...prev]);
          setValue('customer_id', customer.id, { shouldValidate: true });
          setShowAddCustomer(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  hint: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  dtRow: { flexDirection: 'row' },
  dtDate: { flex: 2, marginRight: 10 },
  dtTime: { flex: 1 },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' },
  segmentBtnActive: { backgroundColor: '#2563EB' },
  segmentText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  segmentTextActive: { color: '#fff' },
  summary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: { fontSize: 13, color: '#1F2937', fontWeight: '500' },
  summaryTotal: { fontSize: 16, color: '#10B981', fontWeight: '700' },
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
