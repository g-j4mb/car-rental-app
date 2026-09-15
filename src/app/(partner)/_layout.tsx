import { Tabs, Redirect } from 'expo-router';
import { View, TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/auth.service';
import { toggleLanguage } from '../../lib/language';

export default function PartnerLayout() {
  const { logout, role, isAuthenticated } = useAuthStore();
  const { language } = useUIStore();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role !== 'partner') {
    return <Redirect href="/(staff)/dashboard" />;
  }

  const handleLogout = async () => {
    await authService.signOut();
    logout();
    // The !isAuthenticated guard above will redirect to login on re-render
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#1F2937',
        tabBarActiveTintColor: '#2563EB',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 15 }}>
            <TouchableOpacity onPress={toggleLanguage} style={{ marginRight: 15 }}>
              <View style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#D1D5DB',
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#1F2937' }}>
                  {language === 'en' ? 'AR' : 'EN'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
              <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 14 }}>
                {t('common.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        ),
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('partner.title'),
          tabBarLabel: t('partner.title'),
          tabBarIcon: ({ color }) => <Text>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="my-cars"
        options={{
          title: t('partner.my_cars'),
          tabBarLabel: t('partner.my_cars'),
          tabBarIcon: ({ color }) => <Text>🚗</Text>,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: t('partner.payments'),
          tabBarLabel: t('partner.payments'),
          tabBarIcon: ({ color }) => <Text>💰</Text>,
        }}
      />
    </Tabs>
  );
}
