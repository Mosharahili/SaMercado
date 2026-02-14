import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View, I18nManager } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { AuthStack } from './stacks/AuthStack';
import { CustomerTabs } from './tabs/CustomerTabs';
import { VendorStack } from './stacks/VendorStack';
import { AdminStack } from './stacks/AdminStack';
import { OwnerStack } from './stacks/OwnerStack';
import { theme } from '@theme/theme';

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  const { isRTL, forceRemount } = useLanguage();

  // Initialize RTL on app startup (for initial language)
  React.useEffect(() => {
    I18nManager.allowRTL(true);
    
    // For native platforms, set RTL during initial load
    if (Platform.OS !== 'web') {
      I18nManager.forceRTL(isRTL);
    }
  }, [isRTL]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View key={`nav-${forceRemount}`} style={[styles.root, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <NavigationContainer
        key={`container-${isRTL}-${forceRemount}`}
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.bg,
            primary: theme.colors.primary,
          },
        }}
      >
        {!user ? (
          <AuthStack />
        ) : user.role === 'CUSTOMER' ? (
          <CustomerTabs />
        ) : user.role === 'VENDOR' ? (
          <VendorStack />
        ) : user.role === 'ADMIN' ? (
          <AdminStack />
        ) : (
          <OwnerStack />
        )}
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
