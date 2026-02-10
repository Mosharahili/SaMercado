import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { AuthStack } from './stacks/AuthStack';
import { CustomerTabs } from './tabs/CustomerTabs';
import { VendorStack } from './stacks/VendorStack';
import { AdminStack } from './stacks/AdminStack';
import { OwnerStack } from './stacks/OwnerStack';

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or loading screen
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.role === 'CUSTOMER' ? (
        <CustomerTabs />
      ) : user.role === 'VENDOR' ? (
        <VendorStack />
      ) : user.role === 'ADMIN' ? (
        <AdminStack />
      ) : user.role === 'OWNER' ? (
        <OwnerStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};