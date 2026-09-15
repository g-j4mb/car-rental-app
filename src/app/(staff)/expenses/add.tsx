import { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  expenseFormSchema,
  CAR_EXPENSE_CATEGORIES,
  GENERAL_EXPENSE_CATEGORIES,
  type ExpenseFormInput,
  type ExpenseFormValues,
} from '../../../lib/validation';
import { useAddCarExpense, useAddGeneralExpense } from '../../../hooks/useExpenses';
import { useCars } from '../../../hooks/useCars';
import { todayISO } from '../../../lib/dates';
import { SearchablePicker, type PickerOption } from '../../../components/searchable-picker';

const normalizeType = (type?: string): 'car' | 'general' =>
  type === 'general' ? 'general' : 'car';

// Built fresh each time so the date reflects "today" on every reset.
const makeDefaults = (type?: string): ExpenseFormValues => ({
  expense_type: normalizeType(type),
  car_id: null,
  category: '',
  amount: 0,
  description: '',
  date: todayISO(),
});

export default function AddExpenseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const addCarExpense = useAddCarExpense();
  const addGeneralExpense = useAddGeneralExpense();
  const { data: cars } = useCars();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues, any, ExpenseFormInput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: makeDefaults(type),
  });

  // This screen stays mounted in the Tabs navigator, so re-opening it from the
  // list (with a possibly different type) must re-sync the form to that type.
  useEffect(() => {
    reset(makeDefaults(type));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const expenseType = watch('expense_type');
  const carId = watch('car_id');
  const category = watch('category');

  const categories = expenseType === 'car' ? CAR_EXPENSE_CATEGORIES : GENERAL_EXPENSE_CATEGORIES;

  const carOptions: PickerOption[] = (cars ?? []).map((car) => ({
    id: car.id,
    label: `${car.make} ${car.model}`,
    sublabel: car.plate_number,
  }));

  const switchType = (next: 'car' | 'general') => {
    setValue('expense_type', next);
    setValue('category', ''); // category sets differ between types
    if (next === 'general') setValue('car_id', null);
  };

  const onSubmit = async (data: ExpenseFormInput) => {
    setApiError(null);
    try {
      if (data.expense_type === 'car') {
        await addCarExpense.mutateAsync({
          car_id: data.car_id!,
          category: data.category,
          amount: data.amount,
          description: data.description,
          date: data.date,
        });
      } else {
        await addGeneralExpense.mutateAsync({
          category: data.category,
          amount: data.amount,
          description: data.description,
          date: data.date,
        });
      }
      reset(makeDefaults(type)); // clear for the next entry
      router.replace('/(staff)/expenses');
    } catch (e: any) {
      setApiError(e?.message ?? t('common.error'));
    }
  };

  const isPending = addCarExpense.isPending || addGeneralExpense.isPending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {apiError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{apiError}</Text>
        </View>
      )}

      {/* Type toggle */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('expenses.expense_type')}</Text>
        <View style={styles.segment}>
          {(['car', 'general'] as const).map((tb) => (
            <TouchableOpacity
              key={tb}
              style={[styles.segmentBtn, expenseType === tb && styles.segmentBtnActive]}
              onPress={() => switchType(tb)}
            >
              <Text style={[styles.segmentText, expenseType === tb && styles.segmentTextActive]}>
                {t(`expenses.${tb}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Car picker (car expenses only) */}
      {expenseType === 'car' && (
        <SearchablePicker
          label={t('expenses.select_car')}
          placeholder={t('expenses.select_car')}
          searchPlaceholder={t('expenses.search_car')}
          value={carId ?? undefined}
          options={carOptions}
          onSelect={(id) => setValue('car_id', id, { shouldValidate: true })}
          error={errors.car_id ? String(errors.car_id.message) : undefined}
        />
      )}

      {/* Category pills */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('expenses.category')}</Text>
        <View style={styles.pills}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, category === cat && styles.pillActive]}
              onPress={() => setValue('category', cat, { shouldValidate: true })}
            >
              <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                {t(`expense_categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && <Text style={styles.fieldError}>{String(errors.category.message)}</Text>}
      </View>

      {/* Amount */}
      <Controller
        control={control}
        name="amount"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>{t('expenses.amount')}</Text>
            <TextInput
              value={value != null ? String(value) : ''}
              onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, '') as any)}
              keyboardType="numeric"
              style={[styles.input, errors.amount && styles.inputError]}
            />
            {errors.amount && <Text style={styles.fieldError}>{String(errors.amount.message)}</Text>}
          </View>
        )}
      />

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>{t('expenses.description')}</Text>
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              style={[styles.input, errors.description && styles.inputError]}
            />
            {errors.description && (
              <Text style={styles.fieldError}>{String(errors.description.message)}</Text>
            )}
          </View>
        )}
      />

      {/* Date */}
      <Controller
        control={control}
        name="date"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>{t('expenses.date')}</Text>
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
              style={[styles.input, errors.date && styles.inputError]}
            />
            {errors.date ? (
              <Text style={styles.fieldError}>{String(errors.date.message)}</Text>
            ) : (
              <Text style={styles.hint}>{t('expenses.date_hint')}</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        {isPending && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
        <Text style={styles.submitText}>
          {isPending ? t('common.saving') : t('expenses.save_expense')}
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
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  hint: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
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
  pills: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  pillActive: { backgroundColor: '#2563EB', borderColor: '#1F2937' },
  pillText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  pillTextActive: { color: '#fff' },
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
