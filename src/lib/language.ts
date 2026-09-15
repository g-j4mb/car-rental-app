import { I18nManager, Platform } from 'react-native';
import i18n from '../i18n/config';
import { useUIStore } from '../stores/uiStore';

export type AppLanguage = 'en' | 'ar';

/**
 * Switches the whole app between English (LTR) and Arabic (RTL).
 * - Activates the matching translation bundle (i18next)
 * - Persists the choice in the UI store
 * - Flips layout direction:
 *     web    -> sets <html dir="rtl|ltr">
 *     native -> I18nManager.forceRTL (full effect needs an app reload)
 */
export const applyLanguage = async (lang: AppLanguage): Promise<void> => {
  const isRTL = lang === 'ar';

  // 1. Switch the active translation strings
  await i18n.changeLanguage(lang);

  // 2. Persist in UI store (drives the AR/EN toggle label)
  useUIStore.getState().setLanguage(lang);

  // 3. Apply layout direction
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  } else if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // Note: on native devices a reload is required for RTL to fully apply.
  }
};

export const toggleLanguage = async (): Promise<void> => {
  const current = useUIStore.getState().language;
  await applyLanguage(current === 'en' ? 'ar' : 'en');
};
