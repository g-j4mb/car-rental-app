import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog.
 * Uses window.confirm on web (Alert.alert is unreliable there) and
 * Alert.alert on native. Resolves true if the user confirms.
 */
export const confirmAction = (
  title: string,
  message: string,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel'
): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`);
    return Promise.resolve(!!ok);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
};
