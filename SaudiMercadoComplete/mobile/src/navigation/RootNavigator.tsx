import React, { useRef, useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View, I18nManager } from 'react-native';
import { NavigationContainer, DefaultTheme, NavigationContainerRef } from '@react-navigation/native';
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
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    I18nManager.allowRTL(true);
    // Force RTL direction for native platforms
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View 
      key={`root-${forceRemount}`}
      style={[styles.root, { direction: isRTL ? 'rtl' : 'ltr' }]}
    >
      <NavigationContainer
        ref={navigationRef}
        key={`nav-container-${forceRemount}`}
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
