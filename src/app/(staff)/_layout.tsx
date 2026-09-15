import { Tabs, Redirect } from 'expo-router';
import { TouchableOpacity, View, Text } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/auth.service';
import { toggleLanguage } from '../../lib/language';

export default function StaffLayout() {
  const { logout, role, isAuthenticated } = useAuthStore();
  const { language } = useUIStore();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === 'partner') {
    return <Redirect href="/(partner)/dashboard" />;
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
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('dashboard.title'),
          tabBarLabel: t('dashboard.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="cars/index"
        options={{
          title: t('fleet.title'),
          tabBarLabel: t('fleet.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🚗</Text>,
          href: '/(staff)/cars',
        }}
      />
      <Tabs.Screen
        name="rentals/index"
        options={{
          title: t('rentals.title'),
          tabBarLabel: t('rentals.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📋</Text>,
          href: '/(staff)/rentals',
        }}
      />
      <Tabs.Screen
        name="customers/index"
        options={{
          title: t('customers.title'),
          tabBarLabel: t('customers.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
          href: '/(staff)/customers',
        }}
      />
      <Tabs.Screen
        name="partners/index"
        options={{
          title: t('partners.title'),
          tabBarLabel: t('partners.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🤝</Text>,
          href: '/(staff)/partners',
        }}
      />
      <Tabs.Screen
        name="expenses/index"
        options={{
          title: t('expenses.title'),
          tabBarLabel: t('expenses.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💸</Text>,
          href: '/(staff)/expenses',
        }}
      />
      <Tabs.Screen
        name="reports/index"
        options={{
          title: t('reports.title'),
          tabBarLabel: t('reports.title'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💰</Text>,
          href: '/(staff)/reports',
        }}
      />
      <Tabs.Screen name="cars/[id]" options={{ href: null, title: t('fleet.edit_car') }} />
      <Tabs.Screen name="cars/add" options={{ href: null, title: t('fleet.add_car') }} />
      <Tabs.Screen name="rentals/[id]" options={{ href: null, title: t('rentals.rental_detail') }} />
      <Tabs.Screen name="rentals/new" options={{ href: null, title: t('rentals.new_rental') }} />
      <Tabs.Screen name="customers/[id]" options={{ href: null, title: t('customers.edit_customer') }} />
      <Tabs.Screen name="customers/add" options={{ href: null, title: t('customers.add_customer') }} />
      <Tabs.Screen name="partners/[id]" options={{ href: null, title: t('partners.edit_partner') }} />
      <Tabs.Screen name="partners/add" options={{ href: null, title: t('partners.add_partner') }} />
      <Tabs.Screen name="expenses/add" options={{ href: null, title: t('expenses.add_expense') }} />
      <Tabs.Screen name="reports/partners" options={{ href: null, title: t('reports.partner_settlements') }} />
    </Tabs>
  );
}
