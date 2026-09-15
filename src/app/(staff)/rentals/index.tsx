import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateRange } from '../../../lib/formatters';
import { useRentals } from '../../../hooks/useRentals';
import type { RentalWithRelations } from '../../../services/rental.service';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#DBEAFE', text: '#1D4ED8' },
  reserved: { bg: '#FEF3C7', text: '#B45309' },
  returned: { bg: '#D1FAE5', text: '#047857' },
  cancelled: { bg: '#F3F4F6', text: '#6B7280' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.cancelled;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{t(`rental_status.${status}`)}</Text>
    </View>
  );
};

const RentalCard = ({ rental, onPress }: { rental: RentalWithRelations; onPress: () => void }) => (
  <TouchableOpacity style={styles.rentalCard} onPress={onPress}>
    <View style={styles.rentalHeader}>
      <Text style={styles.customerName}>{rental.customer_name}</Text>
      <Text style={styles.amount}>{formatCurrency(rental.total_amount)}</Text>
    </View>
    <Text style={styles.carName}>{rental.car_name}</Text>
    <View style={styles.rentalFooter}>
      <Text style={styles.dates}>{formatDateRange(rental.start_date, rental.end_date)}</Text>
      <StatusBadge status={rental.status} />
    </View>
  </TouchableOpacity>
);

export default function RentalsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: rentals, isLoading, isError, error } = useRentals();

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
        data={rentals}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>{t('rentals.no_rentals')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <RentalCard rental={item} onPress={() => router.push(`/(staff)/rentals/${item.id}`)} />
        )}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(staff)/rentals/new')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { color: '#EF4444', textAlign: 'center' },
  emptyText: { color: '#6B7280', textAlign: 'center', fontSize: 14 },
  listContent: { padding: 16, flexGrow: 1 },
  rentalCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  amount: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  carName: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  rentalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dates: { fontSize: 12, color: '#9CA3AF' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
});
