import { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { loginSchema, type LoginInput } from '../../lib/validation';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/auth.service';
import { toggleLanguage } from '../../lib/language';
import { BRAND } from '../../constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, isLoading, setLoading } = useAuthStore();
  const { language } = useUIStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  useEffect(() => {
    // Check if user already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { session } = await authService.getSession();
    if (session?.user) {
      const profile = await authService.getProfile(session.user.id);
      if (profile) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          role: profile.role,
          partner_id: profile.partner_id,
        }, session.access_token);
        router.replace(profile.role === 'partner' ? '/(partner)/dashboard' : '/(staff)/dashboard');
      }
    }
  };

  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);
      setApiError(null);

      const { user, profile, session, error } = await authService.signIn(data.email, data.password);

      if (error) {
        setApiError(error);
        setLoading(false);
        return;
      }

      if (user && profile && session) {
        setUser({
          id: user.id,
          email: user.email || '',
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          role: profile.role,
          partner_id: profile.partner_id,
        }, session.access_token);

        router.replace(profile.role === 'partner' ? '/(partner)/dashboard' : '/(staff)/dashboard');
      }
    } catch (error: any) {
      setApiError(t('auth.login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{t('common.app_name')}</Text>
        <TouchableOpacity
          onPress={() => toggleLanguage()}
          style={{ paddingHorizontal: 10 }}
        >
          <Text style={{ fontSize: 14, color: '#1F2937' }}>
            {language === 'en' ? 'AR' : 'EN'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Image
          source={require('../../../assets/images/logo.jpg')}
          style={{ width: 120, height: 120, borderRadius: 60 }}
          resizeMode="cover"
        />
      </View>

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        {t('auth.login')}
      </Text>

      {apiError && (
        <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 15 }}>
          <Text style={{ color: '#DC2626' }}>{apiError}</Text>
        </View>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ marginBottom: 5, fontWeight: '500' }}>{t('auth.email')}</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder={t('auth.email') || ''}
              style={{
                borderWidth: 1,
                borderColor: errors.email ? '#EF4444' : '#D1D5DB',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={{ color: '#EF4444', marginTop: 5, fontSize: 12 }}>
                {errors.email.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ marginBottom: 5, fontWeight: '500' }}>{t('auth.password')}</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder={t('auth.password') || ''}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: errors.password ? '#EF4444' : '#D1D5DB',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
            {errors.password && (
              <Text style={{ color: '#EF4444', marginTop: 5, fontSize: 12 }}>
                {errors.password.message}
              </Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? '#9CA3AF' : BRAND,
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        {isLoading && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
          {isLoading ? t('common.loading') : t('auth.sign_in')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
