import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../i18n/config';
import { applyLanguage } from '../lib/language';
import { useUIStore } from '../stores/uiStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const language = useUIStore((s) => s.language);

  // Sync translations + RTL direction with the saved language on startup
  useEffect(() => {
    applyLanguage(language);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ animationEnabled: false }} />
        <Stack.Screen name="(staff)" options={{ animationEnabled: false }} />
        <Stack.Screen name="(partner)" options={{ animationEnabled: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
