import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  useCarExpenses,
  useGeneralExpenses,
  useRemoveCarExpense,
  useRemoveGeneralExpense,
} from '../../../hooks/useExpenses';
import { confirmAction } from '../../../lib/confirm';
import { formatCurrency, formatDate } from '../../../lib/formatters';

type Tab = 'car' | 'general';

export default function ExpensesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('car');

  const carExpenses = useCarExpenses();
  const generalExpenses = useGeneralExpenses();
  const removeCar = useRemoveCarExpense();
  const removeGeneral = useRemoveGeneralExpense();

  const active = tab === 'car' ? carExpenses : generalExpenses;
  // Union of two row shapes; the card renderer handles each by tab.
  const items: any[] = active.data ?? [];

  const total = useMemo(
    () => items.reduce((sum, e: any) => sum + Number(e.amount), 0),
    [items]
  );

  const handleRemove = async (id: string) => {
    const ok = await confirmAction(
      t('expenses.remove_title'),
      t('expenses.remove_message'),
      t('expenses.remove'),
      t('common.cancel')
    );
    if (!ok) return;
    if (tab === 'car') removeCar.mutate(id);
    else removeGeneral.mutate(id);
  };

  const renderCard = (item: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {tab === 'car' ? item.car_name : t(`expense_categories.${item.category}`)}
        </Text>
        <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
      </View>
      <Text style={styles.meta}>
        {tab === 'car' ? `${t(`expense_categories.${item.category}`)} · ` : ''}
        {formatDate(item.date)}
      </Text>
      {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemove(item.id)}
        disabled={removeCar.isPending || removeGeneral.isPending}
      >
        <Text style={styles.removeBtnText}>🗑  {t('expenses.remove')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Car / General toggle */}
      <View style={styles.segment}>
        {(['car', 'general'] as Tab[]).map((tb) => (
          <TouchableOpacity
            key={tb}
            style={[styles.segmentBtn, tab === tb && styles.segmentBtnActive]}
            onPress={() => setTab(tb)}
          >
            <Text style={[styles.segmentText, tab === tb && styles.segmentTextActive]}>
              {t(`expenses.${tb}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Total for the active tab */}
      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>{t('expenses.total')}</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>

      {active.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : active.isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {(active.error as Error)?.message ?? t('common.error')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {tab === 'car' ? t('expenses.no_car_expenses') : t('expenses.no_general_expenses')}
              </Text>
            </View>
          }
          renderItem={({ item }) => renderCard(item)}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({ pathname: '/(staff)/expenses/add', params: { type: tab } })
        }
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
  segment: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' },
  segmentBtnActive: { backgroundColor: '#2563EB' },
  segmentText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  segmentTextActive: { color: '#fff' },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  totalLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  totalValue: { fontSize: 16, color: '#DC2626', fontWeight: '700' },
  listContent: { padding: 16, paddingTop: 8, flexGrow: 1 },
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
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', flex: 1, marginRight: 8 },
  amount: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  desc: { fontSize: 13, color: '#6B7280', marginTop: 6 },
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
