import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateRange, getMonthKey, getMonthDisplay } from '../../lib/formatters';
import { todayISO } from '../../lib/dates';
import { calculateMonthlyStats, calculatePartnerCommission } from '../../lib/financial';
import { useMyPartner, useMyCars, useMyRentals, useMyCarExpenses } from '../../hooks/usePartnerPortal';

const REVENUE_STATUSES = ['active', 'returned'];

const EarningRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.earningRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default function PartnerDashboardScreen() {
  const { t } = useTranslation();
  const partnerId = useAuthStore((s) => s.user?.partner_id);

  const { data: partner } = useMyPartner(partnerId);
  const { data: cars, isLoading: carsLoading } = useMyCars(partnerId);
  const { data: rentals, isLoading: rentalsLoading } = useMyRentals(partnerId);
  const { data: carExpenses, isLoading: expLoading } = useMyCarExpenses(partnerId);

  const monthKey = getMonthKey(todayISO());

  const earnings = useMemo(() => {
    const monthRentals = (rentals ?? []).filter(
      (r) => REVENUE_STATUSES.includes(r.status) && getMonthKey(r.start_date) === monthKey
    );
    const monthExpenses = (carExpenses ?? []).filter((e) => getMonthKey(e.month) === monthKey);
    const { totalRevenue, totalExpenses, netProfit } = calculateMonthlyStats(
      monthRentals,
      monthExpenses,
      []
    );
    const myShare = calculatePartnerCommission(netProfit, partner?.commission_rate ?? 0);
    return { totalRevenue, totalExpenses, myShare };
  }, [rentals, carExpenses, partner, monthKey]);

  const recentRentals = (rentals ?? []).slice(0, 5);

  if (carsLoading || rentalsLoading || expLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Earnings */}
      <Text style={styles.sectionTitle}>
        {t('partner.my_earnings')} — {getMonthDisplay(monthKey)}
      </Text>
      <View style={styles.earningsCard}>
        <EarningRow label={t('partner.gross_revenue')} value={formatCurrency(earnings.totalRevenue)} />
        <EarningRow label={t('partner.car_expenses')} value={formatCurrency(earnings.totalExpenses)} />
        <View style={styles.divider} />
        <EarningRow label={t('partner.my_share')} value={formatCurrency(earnings.myShare)} />
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{t('partner.status')}:</Text>
          <Text style={styles.statusBadge}>{t('partner.pending')}</Text>
        </View>
      </View>

      {/* My cars */}
      <Text style={styles.sectionTitle}>{t('partner.my_cars')}</Text>
      {(cars ?? []).length === 0 ? (
        <Text style={styles.emptyText}>{t('partner.no_cars')}</Text>
      ) : (
        (cars ?? []).map((car) => (
          <View key={car.id} style={styles.carCard}>
            <Text style={styles.carName}>
              {car.make} {car.model} {car.plate_number}
            </Text>
            <Text style={styles.carStatus}>{t(`car_status.${car.status}`)}</Text>
          </View>
        ))
      )}

      {/* Recent rentals */}
      <Text style={styles.sectionTitle}>{t('partner.recent_rentals')}</Text>
      {recentRentals.length === 0 ? (
        <Text style={styles.emptyText}>{t('partner.no_rentals')}</Text>
      ) : (
        recentRentals.map((rental) => (
          <View key={rental.id} style={styles.rentalRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rentalCar}>{rental.car_name}</Text>
              <Text style={styles.rentalDates}>
                {formatDateRange(rental.start_date, rental.end_date)}
              </Text>
            </View>
            <Text style={styles.rentalAmount}>{formatCurrency(rental.total_amount)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 16,
  },
  emptyText: { fontSize: 13, color: '#6B7280' },
  earningsCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  earningRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 13, color: '#6B7280' },
  value: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  statusLabel: { fontSize: 13, color: '#6B7280' },
  statusBadge: { fontSize: 13, fontWeight: '600', color: '#F59E0B' },
  carCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  carName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  carStatus: { fontSize: 12, color: '#6B7280' },
  rentalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 8,
  },
  rentalCar: { fontSize: 13, fontWeight: '500', color: '#1F2937' },
  rentalDates: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rentalAmount: { fontSize: 13, fontWeight: '600', color: '#10B981', marginLeft: 8 },
});
