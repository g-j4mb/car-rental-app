import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate, getDayCount } from '../../lib/formatters';
import { todayISO } from '../../lib/dates';
import { useRentals } from '../../hooks/useRentals';
import { useCars } from '../../hooks/useCars';
import { getDashboardStats, getDueBack } from '../../lib/reports';

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { data: rentals, isLoading: rentalsLoading } = useRentals();
  const { data: cars, isLoading: carsLoading } = useCars();

  const today = todayISO();

  const stats = useMemo(
    () => getDashboardStats(rentals ?? [], cars ?? [], today),
    [rentals, cars, today]
  );
  const dueBack = useMemo(() => getDueBack(rentals ?? [], today), [rentals, today]);

  if (rentalsLoading || carsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.statsGrid}>
        <StatCard label={t('dashboard.active_rentals')} value={stats.activeRentals} />
        <StatCard label={t('dashboard.due_today')} value={stats.dueToday} />
        <StatCard label={t('dashboard.this_month')} value={formatCurrency(stats.monthlyRevenue)} />
        <StatCard
          label={t('dashboard.available_cars')}
          value={`${stats.availableCars} / ${stats.totalCars}`}
        />
      </View>

      <Text style={styles.sectionTitle}>{t('dashboard.due_back_today')}</Text>
      {dueBack.length === 0 ? (
        <Text style={styles.emptyText}>{t('dashboard.none_due')}</Text>
      ) : (
        dueBack.map((rental) => {
          const overdueDays = getDayCount(rental.end_date, today); // 0 = due today
          return (
            <View
              key={rental.id}
              style={[styles.dueBackCard, overdueDays > 0 && styles.dueBackOverdue]}
            >
              <Text style={styles.carName}>{rental.car_name}</Text>
              <Text style={styles.cardSubtext}>
                {rental.customer_name} · {formatDate(rental.end_date)}
              </Text>
              <Text style={[styles.tag, overdueDays > 0 ? styles.tagOverdue : styles.tagDue]}>
                {overdueDays > 0
                  ? `${t('dashboard.overdue')} · ${t('rentals.days', { count: overdueDays })}`
                  : t('dashboard.due')}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { padding: 16 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statLabel: { fontSize: 12, color: '#6B7280', marginBottom: 8, textAlign: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  dueBackCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  dueBackOverdue: { borderLeftColor: '#EF4444' },
  carName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  cardSubtext: { fontSize: 12, color: '#6B7280' },
  tag: { fontSize: 11, fontWeight: '700', marginTop: 6 },
  tagDue: { color: '#B45309' },
  tagOverdue: { color: '#EF4444' },
});
