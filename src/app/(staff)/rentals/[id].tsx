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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useRental, useAdjustRental, useReturnRental, useCancelRental } from '../../../hooks/useRentals';
import { formatCurrency, formatDate, getDayCount } from '../../../lib/formatters';
import { todayISO, addDaysISO, isCreatedToday } from '../../../lib/dates';
import { calculateRentalAmount, calculateSettlement } from '../../../lib/financial';
import { confirmAction } from '../../../lib/confirm';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#DBEAFE', text: '#1D4ED8' },
  reserved: { bg: '#FEF3C7', text: '#B45309' },
  returned: { bg: '#D1FAE5', text: '#047857' },
  cancelled: { bg: '#F3F4F6', text: '#6B7280' },
};

const isoOk = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, strong && styles.rowValueStrong]}>{value}</Text>
  </View>
);

export default function RentalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: rental, isLoading } = useRental(id);
  const adjustRental = useAdjustRental(id);
  const returnRental = useReturnRental(id);
  const cancelRental = useCancelRental();

  const [newEnd, setNewEnd] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Settlement panel state
  const [settling, setSettling] = useState(false);
  const [returnDate, setReturnDate] = useState(todayISO());
  const [discountText, setDiscountText] = useState('0');
  const [penaltyText, setPenaltyText] = useState('0');

  useEffect(() => {
    if (rental) setNewEnd(rental.end_date);
  }, [rental?.end_date]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!rental) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('common.error')}</Text>
      </View>
    );
  }

  const c = STATUS_COLORS[rental.status] ?? STATUS_COLORS.cancelled;
  const canModify = rental.status === 'active' || rental.status === 'reserved';
  const canDelete = canModify && isCreatedToday(rental.created_at);

  // --- Adjust (extend / shrink) ---
  const adjustValid = isoOk(newEnd) && newEnd > rental.start_date;
  const adjustedDays = adjustValid ? getDayCount(rental.start_date, newEnd) : 0;
  const adjustedTotal = adjustValid
    ? calculateRentalAmount(rental.daily_rate, rental.start_date, newEnd)
    : 0;
  const endChanged = newEnd !== rental.end_date;

  // --- Settlement ---
  const discount = Number(discountText) || 0;
  const penalty = Number(penaltyText) || 0;
  const returnValid = isoOk(returnDate) && returnDate >= rental.start_date;
  const settlement = returnValid
    ? calculateSettlement({
        dailyRate: rental.daily_rate,
        startDate: rental.start_date,
        actualReturnDate: returnDate,
        depositAmount: rental.deposit_amount,
        amountPaid: rental.amount_paid,
        discount,
        penalty,
      })
    : null;

  const handleError = (e: any) => {
    const code = e?.message;
    if (code === 'CAR_UNAVAILABLE') setApiError(t('rentals.error_car_unavailable'));
    else if (code === 'END_BEFORE_START') setApiError(t('rentals.error_end_before_start'));
    else if (code === 'RETURN_BEFORE_START') setApiError(t('rentals.error_return_before_start'));
    else if (code === 'NOT_SAME_DAY') setApiError(t('rentals.error_not_same_day'));
    else setApiError(code ?? t('common.error'));
  };

  const handleAdjust = async () => {
    setApiError(null);
    try {
      await adjustRental.mutateAsync({ end_date: newEnd });
    } catch (e) {
      handleError(e);
    }
  };

  const handleConfirmReturn = async () => {
    setApiError(null);
    try {
      await returnRental.mutateAsync({
        actual_return_date: returnDate,
        discount_amount: discount,
        penalty_amount: penalty,
      });
      router.replace('/(staff)/rentals');
    } catch (e) {
      handleError(e);
    }
  };

  const handleDelete = async () => {
    setApiError(null);
    const ok = await confirmAction(
      t('rentals.delete_title'),
      t('rentals.delete_message'),
      t('rentals.delete'),
      t('common.cancel')
    );
    if (!ok) return;
    try {
      await cancelRental.mutateAsync(id);
      router.replace('/(staff)/rentals');
    } catch (e) {
      handleError(e);
    }
  };

  const busy = adjustRental.isPending || returnRental.isPending || cancelRental.isPending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {apiError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{apiError}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.customer}>{rental.customer_name}</Text>
        <View style={[styles.badge, { backgroundColor: c.bg }]}>
          <Text style={[styles.badgeText, { color: c.text }]}>
            {t(`rental_status.${rental.status}`)}
          </Text>
        </View>
      </View>
      <Text style={styles.car}>{rental.car_name}</Text>

      {/* Summary */}
      <View style={styles.card}>
        <Row
          label={t('rentals.start_date')}
          value={`${formatDate(rental.start_date)} · ${(rental.start_time ?? '').slice(0, 5)}`}
        />
        <Row
          label={t('rentals.end_date')}
          value={`${formatDate(rental.end_date)} · ${(rental.end_time ?? '').slice(0, 5)}`}
        />
        <Row
          label={t('rentals.duration')}
          value={t('rentals.days', { count: getDayCount(rental.start_date, rental.end_date) })}
        />
        <Row label={t('rentals.daily_rate')} value={formatCurrency(rental.daily_rate)} />
        <Row label={t('rentals.deposit')} value={formatCurrency(rental.deposit_amount)} />
        <Row label={t('rentals.total')} value={formatCurrency(rental.total_amount)} />
        {rental.status === 'returned' && (
          <>
            {rental.actual_return_date && (
              <Row
                label={t('rentals.actual_return_date')}
                value={formatDate(rental.actual_return_date)}
              />
            )}
            {rental.discount_amount > 0 && (
              <Row label={t('rentals.discount')} value={`- ${formatCurrency(rental.discount_amount)}`} />
            )}
            {rental.penalty_amount > 0 && (
              <Row label={t('rentals.penalty')} value={`+ ${formatCurrency(rental.penalty_amount)}`} />
            )}
            {rental.settled_total != null && (
              <Row label={t('rentals.settled_total')} value={formatCurrency(rental.settled_total)} strong />
            )}
          </>
        )}
        {rental.notes ? <Row label={t('rentals.notes')} value={rental.notes} /> : null}
      </View>

      {/* Adjust (extend / shrink) */}
      {canModify && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rentals.adjust')}</Text>
          <Text style={styles.hint}>{t('rentals.adjust_hint')}</Text>

          <Text style={[styles.label, { marginTop: 12 }]}>{t('rentals.new_end_date')}</Text>
          <View style={styles.stepRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => isoOk(newEnd) && setNewEnd(addDaysISO(newEnd, -1))}
            >
              <Text style={styles.stepBtnText}>−1</Text>
            </TouchableOpacity>
            <TextInput
              value={newEnd}
              onChangeText={setNewEnd}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
              style={[styles.input, styles.stepInput, !adjustValid && styles.inputError]}
            />
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => isoOk(newEnd) && setNewEnd(addDaysISO(newEnd, 1))}
            >
              <Text style={styles.stepBtnText}>+1</Text>
            </TouchableOpacity>
          </View>

          {adjustValid ? (
            <View style={styles.adjustPreview}>
              <Text style={styles.previewText}>{t('rentals.days', { count: adjustedDays })}</Text>
              <Text style={styles.previewTotal}>{formatCurrency(adjustedTotal)}</Text>
            </View>
          ) : (
            <Text style={styles.fieldError}>{t('rentals.error_end_before_start')}</Text>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, (!endChanged || !adjustValid || busy) && styles.btnDisabled]}
            onPress={handleAdjust}
            disabled={!endChanged || !adjustValid || busy}
          >
            {adjustRental.isPending && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
            <Text style={styles.primaryBtnText}>{t('rentals.save_adjustment')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Return / Deliver with settlement */}
      {canModify && !settling && (
        <TouchableOpacity
          style={[styles.returnBtn, busy && styles.btnDisabled]}
          onPress={() => setSettling(true)}
          disabled={busy}
        >
          <Text style={styles.returnBtnText}>{t('rentals.return_deliver')}</Text>
        </TouchableOpacity>
      )}

      {canModify && settling && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rentals.settlement')}</Text>
          <Text style={styles.hint}>{t('rentals.settlement_hint')}</Text>

          <Text style={[styles.label, { marginTop: 12 }]}>{t('rentals.actual_return_date')}</Text>
          <TextInput
            value={returnDate}
            onChangeText={setReturnDate}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            style={[styles.input, !returnValid && styles.inputError]}
          />

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={styles.label}>{t('rentals.discount')}</Text>
              <TextInput
                value={discountText}
                onChangeText={(text) => setDiscountText(text.replace(/[^0-9.]/g, ''))}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>{t('rentals.penalty')}</Text>
              <TextInput
                value={penaltyText}
                onChangeText={(text) => setPenaltyText(text.replace(/[^0-9.]/g, ''))}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          {settlement ? (
            <View style={styles.settleBox}>
              <Row
                label={t('rentals.actual_days')}
                value={t('rentals.days', { count: settlement.days })}
              />
              <Row
                label={t('rentals.recalculated_charge')}
                value={formatCurrency(settlement.recalculatedCharge)}
              />
              {penalty > 0 && (
                <Row label={t('rentals.penalty')} value={`+ ${formatCurrency(penalty)}`} />
              )}
              {discount > 0 && (
                <Row label={t('rentals.discount')} value={`- ${formatCurrency(discount)}`} />
              )}
              <View style={styles.divider} />
              <Row
                label={t('rentals.settled_total')}
                value={formatCurrency(settlement.settledTotal)}
                strong
              />
              <Row label={t('rentals.deposit_held')} value={`- ${formatCurrency(rental.deposit_amount)}`} />
              {rental.amount_paid > 0 && (
                <Row label={t('rentals.already_paid')} value={`- ${formatCurrency(rental.amount_paid)}`} />
              )}
              {settlement.collectNow >= 0 ? (
                <View style={styles.collectRow}>
                  <Text style={styles.collectLabel}>{t('rentals.collect_now')}</Text>
                  <Text style={styles.collectValue}>{formatCurrency(settlement.collectNow)}</Text>
                </View>
              ) : (
                <View style={styles.collectRow}>
                  <Text style={styles.collectLabel}>{t('rentals.refund_due')}</Text>
                  <Text style={[styles.collectValue, { color: '#B45309' }]}>
                    {formatCurrency(Math.abs(settlement.collectNow))}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.fieldError}>{t('rentals.error_return_before_start')}</Text>
          )}

          <TouchableOpacity
            style={[styles.confirmBtn, (!returnValid || busy) && styles.btnDisabled]}
            onPress={handleConfirmReturn}
            disabled={!returnValid || busy}
          >
            {returnRental.isPending && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
            <Text style={styles.confirmBtnText}>{t('rentals.confirm_return')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelLink} onPress={() => setSettling(false)} disabled={busy}>
            <Text style={styles.cancelLinkText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Same-day delete */}
      {canModify && (
        <View style={styles.deleteSection}>
          {canDelete ? (
            <TouchableOpacity
              style={[styles.deleteBtn, busy && styles.btnDisabled]}
              onPress={handleDelete}
              disabled={busy}
            >
              <Text style={styles.deleteBtnText}>🗑  {t('rentals.delete')}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.deleteHint}>{t('rentals.delete_only_same_day')}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { color: '#EF4444', textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customer: { fontSize: 20, fontWeight: '700', color: '#1F2937', flex: 1 },
  car: { fontSize: 14, color: '#6B7280', marginTop: 2, marginBottom: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 13, color: '#6B7280' },
  rowValue: { fontSize: 14, color: '#1F2937', fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  rowValueStrong: { fontWeight: '700' },
  section: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  hint: { color: '#9CA3AF', fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 15 },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepInput: { flex: 1, marginHorizontal: 8, textAlign: 'center' },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  adjustPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  previewText: { fontSize: 13, color: '#6B7280' },
  previewTotal: { fontSize: 16, color: '#10B981', fontWeight: '700' },
  twoCol: { flexDirection: 'row', marginTop: 14 },
  col: { flex: 1, marginRight: 10 },
  settleBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 6 },
  collectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  collectLabel: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  collectValue: { fontSize: 18, fontWeight: '800', color: '#10B981' },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },
  returnBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  returnBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  confirmBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelLink: { alignItems: 'center', paddingVertical: 12 },
  cancelLinkText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  deleteSection: { marginTop: 4, alignItems: 'center' },
  deleteBtn: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },
  deleteBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  deleteHint: { color: '#9CA3AF', fontSize: 12, textAlign: 'center' },
  errorBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorBoxText: { color: '#DC2626', fontSize: 13 },
});
