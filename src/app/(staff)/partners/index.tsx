import { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePartners, useRemovePartner } from '../../../hooks/usePartners';
import { useCars } from '../../../hooks/useCars';
import { confirmAction } from '../../../lib/confirm';
import { Partner } from '../../../types';

export default function PartnersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: partners, isLoading, isError, error } = usePartners();
  const { data: cars } = useCars();
  const removePartner = useRemovePartner();

  // Count active (non-inactive) cars owned by each partner.
  const carCountByPartner = useMemo(() => {
    const counts: Record<string, number> = {};
    (cars ?? []).forEach((car) => {
      if (car.owner_type === 'partner' && car.partner_id) {
        counts[car.partner_id] = (counts[car.partner_id] ?? 0) + 1;
      }
    });
    return counts;
  }, [cars]);

  const handleRemove = async (partner: Partner) => {
    const ok = await confirmAction(
      t('partners.remove_partner_title'),
      t('partners.remove_partner_message'),
      t('partners.remove'),
      t('common.cancel')
    );
    if (ok) removePartner.mutate(partner.id);
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
        data={partners}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>{t('partners.no_partners')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(staff)/partners/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.rate}>{item.commission_rate}%</Text>
            </View>
            <Text style={styles.phone}>{item.phone}</Text>
            <View style={styles.carsRow}>
              <Text style={styles.carsCount}>
                🚗 {t('partners.car_count', { count: carCountByPartner[item.id] ?? 0 })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(item)}
              disabled={removePartner.isPending}
            >
              <Text style={styles.removeBtnText}>🗑  {t('partners.remove')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(staff)/partners/add')}>
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
  card: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  rate: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  phone: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  carsRow: { marginBottom: 10 },
  carsCount: { fontSize: 13, color: '#374151', fontWeight: '500' },
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
