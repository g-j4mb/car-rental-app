import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCars, useRemoveCar } from '../../../hooks/useCars';
import { confirmAction } from '../../../lib/confirm';
import { Car } from '../../../types';

const STATUS_COLORS: Record<string, string> = {
  available: '#10B981',
  rented: '#F59E0B',
  maintenance: '#6B7280',
  inactive: '#9CA3AF',
};

export default function CarsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: cars, isLoading, isError, error, refetch } = useCars();
  const removeCar = useRemoveCar();

  // Refresh the list whenever this screen regains focus (e.g. returning from
  // the add/edit screen, which stays mounted in the Tabs navigator).
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRemove = async (car: Car) => {
    const ok = await confirmAction(
      t('fleet.remove_car_title'),
      t('fleet.remove_car_message'),
      t('fleet.remove'),
      t('common.cancel')
    );
    if (ok) {
      removeCar.mutate(car.id);
    }
  };

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
            <Text style={styles.emptyText}>{t('fleet.no_cars')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.carCard}
            onPress={() => router.push(`/(staff)/cars/${item.id}`)}
          >
            <View style={styles.carHeader}>
              <Text style={styles.carName}>{item.make} {item.model}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <Text style={styles.badgeText}>{t(`car_status.${item.status}`)}</Text>
              </View>
            </View>
            <Text style={styles.carPlate}>{item.plate_number} · {item.year}</Text>
            <Text style={styles.carOwner}>
              {item.owner_type === 'company' ? t('fleet.owner_company') : t('fleet.owner_partner')}
            </Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(item)}
              disabled={removeCar.isPending}
            >
              <Text style={styles.removeBtnText}>🗑  {t('fleet.remove')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(staff)/cars/add')}
      >
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
  carPlate: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  carOwner: { fontSize: 12, color: '#9CA3AF', marginBottom: 10 },
  removeBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  removeBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
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
