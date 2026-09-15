import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getMonthDisplay, shiftMonthKey } from '../lib/formatters';

interface Props {
  monthKey: string;
  onChange: (monthKey: string) => void;
}

// Prev / next month navigator with the current month label. Used by reports.
export function MonthSelector({ monthKey, onChange }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.arrow} onPress={() => onChange(shiftMonthKey(monthKey, -1))}>
        <Text style={styles.arrowText}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.label}>{getMonthDisplay(monthKey)}</Text>
      <TouchableOpacity style={styles.arrow} onPress={() => onChange(shiftMonthKey(monthKey, 1))}>
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 16,
  },
  arrow: {
    width: 40,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  arrowText: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  label: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
});
