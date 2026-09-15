import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getMonthKey } from '../../../lib/formatters';
import { todayISO } from '../../../lib/dates';
import { useRentals } from '../../../hooks/useRentals';
import { useCarExpenses, useGeneralExpenses } from '../../../hooks/useExpenses';
import { useCars } from '../../../hooks/useCars';
import { getMonthlySummary, getPerCarBreakdown } from '../../../lib/reports';
import { MonthSelector } from '../../../components/month-selector';

export default function ReportsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [monthKey, setMonthKey] = useState(getMonthKey(todayISO()));

  const { data: rentals, isLoading: l1 } = useRentals();
  const { data: carExpenses, isLoading: l2 } = useCarExpenses();
  const { data: generalExpenses, isLoading: l3 } = useGeneralExpenses();
  const { data: cars, isLoading: l4 } = useCars();

  const summary = useMemo(
    () => getMonthlySummary(rentals ?? [], carExpenses ?? [], generalExpenses ?? [], monthKey),
    [rentals, carExpenses, generalExpenses, monthKey]
  );
  const perCar = useMemo(
    () => getPerCarBreakdown(cars ?? [], rentals ?? [], carExpenses ?? [], monthKey),
    [cars, rentals, carExpenses, monthKey]
  );

  const loading = l1 || l2 || l3 || l4;

  const profitColor = (v: number) => (v >= 0 ? '#10B981' : '#EF4444');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MonthSelector monthKey={monthKey} onChange={setMonthKey} />

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Summary */}
          <Text style={styles.sectionTitle}>{t('reports.summary')}</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('reports.total_revenue')}</Text>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                {formatCurrency(summary.totalRevenue)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('reports.total_expenses')}</Text>
              <Text style={[styles.summaryValue, { color: '#DC2626' }]}>
                {formatCurrency(summary.totalExpenses)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.netLabel}>{t('reports.net_profit')}</Text>
              <Text style={[styles.netValue, { color: profitColor(summary.netProfit) }]}>
                {formatCurrency(summary.netProfit)}
              </Text>
            </View>
          </View>

          {/* Partner settlements link */}
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.push('/(staff)/reports/partners')}
          >
            <Text style={styles.linkBtnText}>{t('reports.partner_settlements')} ›</Text>
          </TouchableOpacity>

          {/* Per-car breakdown */}
          <Text style={styles.sectionTitle}>{t('reports.per_car')}</Text>
          {perCar.length === 0 ? (
            <Text style={styles.emptyText}>{t('reports.no_data')}</Text>
          ) : (
            perCar.map(({ car, revenue, expenses, profit }) => (
              <View key={car.id} style={styles.carCard}>
                <Text style={styles.carName}>
                  {car.make} {car.model} {car.plate_number}
                </Text>
                <View style={styles.carRow}>
                  <Text style={styles.carStat}>
                    {t('reports.revenue')}: <Text style={{ color: '#10B981' }}>{formatCurrency(revenue)}</Text>
                  </Text>
                  <Text style={styles.carStat}>
                    {t('reports.expenses')}: <Text style={{ color: '#DC2626' }}>{formatCurrency(expenses)}</Text>
                  </Text>
                </View>
                <Text style={styles.carProfit}>
                  {t('reports.profit')}:{' '}
                  <Text style={{ color: profitColor(profit), fontWeight: '700' }}>
                    {formatCurrency(profit)}
                  </Text>
                </Text>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12, marginTop: 8 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  netLabel: { fontSize: 15, color: '#1F2937', fontWeight: '700' },
  netValue: { fontSize: 18, fontWeight: '800' },
  linkBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  linkBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  carCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  carName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  carRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  carStat: { fontSize: 13, color: '#6B7280' },
  carProfit: { fontSize: 13, color: '#6B7280' },
});
