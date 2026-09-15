import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getMonthKey } from '../../../lib/formatters';
import { todayISO } from '../../../lib/dates';
import { useRentals } from '../../../hooks/useRentals';
import { useCarExpenses } from '../../../hooks/useExpenses';
import { useCars } from '../../../hooks/useCars';
import { usePartners } from '../../../hooks/usePartners';
import { getPartnerSettlements } from '../../../lib/reports';
import { MonthSelector } from '../../../components/month-selector';

export default function PartnerSettlementsScreen() {
  const { t } = useTranslation();
  const [monthKey, setMonthKey] = useState(getMonthKey(todayISO()));

  const { data: partners, isLoading: l1 } = usePartners();
  const { data: cars, isLoading: l2 } = useCars();
  const { data: rentals, isLoading: l3 } = useRentals();
  const { data: carExpenses, isLoading: l4 } = useCarExpenses();

  const settlements = useMemo(
    () => getPartnerSettlements(partners ?? [], cars ?? [], rentals ?? [], carExpenses ?? [], monthKey),
    [partners, cars, rentals, carExpenses, monthKey]
  );

  const loading = l1 || l2 || l3 || l4;
  const profitColor = (v: number) => (v >= 0 ? '#10B981' : '#EF4444');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MonthSelector monthKey={monthKey} onChange={setMonthKey} />

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : settlements.length === 0 ? (
        <Text style={styles.emptyText}>{t('partners.no_partners')}</Text>
      ) : (
        settlements.map(({ partner, revenue, expenses, netProfit, commission }) => (
          <View key={partner.id} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.name}>{partner.name}</Text>
              <Text style={styles.rate}>
                {t('reports.commission_rate')}: {partner.commission_rate}%
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('reports.revenue')}</Text>
              <Text style={[styles.value, { color: '#10B981' }]}>{formatCurrency(revenue)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('reports.expenses')}</Text>
              <Text style={[styles.value, { color: '#DC2626' }]}>{formatCurrency(expenses)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('reports.net_profit')}</Text>
              <Text style={[styles.value, { color: profitColor(netProfit) }]}>
                {formatCurrency(netProfit)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.commissionLabel}>{t('reports.commission')}</Text>
              <Text style={styles.commissionValue}>{formatCurrency(commission)}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  rate: { fontSize: 12, color: '#6B7280' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { fontSize: 13, color: '#6B7280' },
  value: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  commissionLabel: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  commissionValue: { fontSize: 18, fontWeight: '800', color: '#2563EB' },
});
