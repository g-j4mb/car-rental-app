import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export interface PickerOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface Props {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  value?: string;
  options: PickerOption[];
  onSelect: (id: string) => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  emptyText?: string;
  error?: string;
}

// Autocomplete-style overlay picker. Designed for large lists (thousands of
// customers): the trigger shows the current selection, tapping opens a modal
// with a search box and a virtualized, filtered list. Optionally surfaces an
// "add new" action at the top.
export function SearchablePicker({
  label,
  placeholder,
  searchPlaceholder,
  value,
  options,
  onSelect,
  onAddNew,
  addNewLabel,
  emptyText,
  error,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(() => options.find((o) => o.id === value), [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel ? o.sublabel.toLowerCase().includes(q) : false)
    );
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setOpen(true)}
      >
        <Text style={selected ? styles.triggerText : styles.triggerPlaceholder} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
      {error && <Text style={styles.fieldError}>{error}</Text>}

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={close}>
                <Text style={styles.closeText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              autoFocus
              autoCapitalize="none"
              style={styles.search}
            />

            {onAddNew && (
              <TouchableOpacity
                style={styles.addNew}
                onPress={() => {
                  close();
                  onAddNew();
                }}
              >
                <Text style={styles.addNewText}>＋ {addNewLabel ?? t('common.add')}</Text>
              </TouchableOpacity>
            )}

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.empty}>{emptyText ?? t('common.error')}</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.row, item.id === value && styles.rowActive]}
                  onPress={() => {
                    onSelect(item.id);
                    close();
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    {item.sublabel ? <Text style={styles.rowSub}>{item.sublabel}</Text> : null}
                  </View>
                  {item.id === value && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
  },
  triggerError: { borderColor: '#EF4444' },
  triggerText: { fontSize: 15, color: '#1F2937', flex: 1 },
  triggerPlaceholder: { fontSize: 15, color: '#9CA3AF', flex: 1 },
  chevron: { fontSize: 14, color: '#6B7280', marginLeft: 8 },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  closeText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  search: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  addNew: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 4,
  },
  addNewText: { fontSize: 15, color: '#2563EB', fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowActive: { backgroundColor: '#F9FAFB' },
  rowLabel: { fontSize: 15, color: '#1F2937' },
  rowSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  check: { color: '#10B981', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, paddingVertical: 24 },
});
