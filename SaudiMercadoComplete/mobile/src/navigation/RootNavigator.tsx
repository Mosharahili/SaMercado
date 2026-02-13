import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
  const { isRTL } = useLanguage();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <NavigationContainer
        direction={isRTL ? 'rtl' : 'ltr'}
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
