import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useMyCars } from '../../hooks/usePartnerPortal';

const STATUS_COLORS: Record<string, string> = {
  available: '#10B981',
  rented: '#F59E0B',
  maintenance: '#6B7280',
  inactive: '#9CA3AF',
};

export default function MyCarScreen() {
  const { t } = useTranslation();
  const partnerId = useAuthStore((s) => s.user?.partner_id);
  const { data: cars, isLoading, isError, error } = useMyCars(partnerId);

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
        data={cars}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>{t('partner.no_cars')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.carCard}>
            <View style={styles.carHeader}>
              <Text style={styles.carName}>
                {item.make} {item.model}
              </Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <Text style={styles.badgeText}>{t(`car_status.${item.status}`)}</Text>
              </View>
            </View>
            <Text style={styles.carPlate}>
              {item.plate_number} · {item.year}
            </Text>
          </View>
        )}
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
  carCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  carPlate: { fontSize: 13, color: '#6B7280' },
});
