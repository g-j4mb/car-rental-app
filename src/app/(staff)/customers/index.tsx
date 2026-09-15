import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCustomersInfinite, useRemoveCustomer } from '../../../hooks/useCustomers';
import { confirmAction } from '../../../lib/confirm';
import { Customer } from '../../../types';

export default function CustomersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const removeCustomer = useRemoveCustomer();

  // Debounce the search so we don't fire a query on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useCustomersInfinite(debouncedSearch);

  // Refresh whenever this screen regains focus (e.g. returning from add/edit).
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const customers = useMemo(
    () => data?.pages.flatMap((p) => p.rows) ?? [],
    [data]
  );

  const handleRemove = async (customer: Customer) => {
    const ok = await confirmAction(
      t('customers.remove_customer_title'),
      t('customers.remove_customer_message'),
      t('customers.remove'),
      t('common.cancel')
    );
    if (ok) removeCustomer.mutate(customer.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('customers.search_placeholder')}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          style={styles.searchInput}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{(error as Error)?.message ?? t('common.error')}</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {debouncedSearch ? t('customers.no_results') : t('customers.no_customers')}
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color="#2563EB" style={{ marginVertical: 16 }} />
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(staff)/customers/${item.id}`)}
            >
              <Text style={styles.name}>{item.full_name}</Text>
              {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
              {item.license_number ? (
                <Text style={styles.sub}>
                  {t('customers.license_number')}: {item.license_number}
                </Text>
              ) : null}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item)}
                disabled={removeCustomer.isPending}
              >
                <Text style={styles.removeBtnText}>🗑  {t('customers.remove')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(staff)/customers/add')}>
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
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  listContent: { padding: 16, flexGrow: 1 },
  card: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  phone: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  sub: { fontSize: 12, color: '#9CA3AF', marginTop: 2, marginBottom: 10 },
  removeBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
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
