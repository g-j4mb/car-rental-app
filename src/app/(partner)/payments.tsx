import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, getMonthDisplay, getMonthKey } from '../../lib/formatters';
import { useMyPayments } from '../../hooks/usePartnerPortal';

export default function PaymentsScreen() {
  const { t } = useTranslation();
  const partnerId = useAuthStore((s) => s.user?.partner_id);
  const { data: payments, isLoading, isError, error } = useMyPayments(partnerId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{(error as Error)?.message ?? t('common.error')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>{t('partner.no_payments')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const paid = !!item.paid_at;
          return (
            <View style={styles.paymentCard}>
              <View style={styles.header}>
                <Text style={styles.month}>{getMonthDisplay(getMonthKey(item.month))}</Text>
                <Text style={[styles.status, paid ? styles.statusPaid : styles.statusPending]}>
                  {paid ? `✓ ${t('partner.paid')}` : `⏳ ${t('partner.pending')}`}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('partner.gross_revenue')}</Text>
                <Text style={styles.value}>{formatCurrency(item.gross_revenue)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('partner.car_expenses')}</Text>
                <Text style={styles.value}>{formatCurrency(item.total_car_expenses)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.labelBold}>{t('partner.my_share')}</Text>
                <Text style={styles.valueBold}>{formatCurrency(item.commission_amount)}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { color: '#EF4444', textAlign: 'center' },
  emptyText: { color: '#6B7280', textAlign: 'center', fontSize: 14 },
  listContent: { padding: 16, flexGrow: 1 },
  paymentCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  month: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  status: { fontSize: 12, fontWeight: '500' },
  statusPaid: { color: '#10B981' },
  statusPending: { color: '#F59E0B' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 12, color: '#6B7280' },
  labelBold: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  value: { fontSize: 12, color: '#6B7280' },
  valueBold: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
});
