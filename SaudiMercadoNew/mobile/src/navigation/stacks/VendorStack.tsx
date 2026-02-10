import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VendorDashboardScreen } from '@screens/vendor/VendorDashboardScreen';
import { VendorProductsScreen } from '@screens/vendor/VendorProductsScreen';
import { VendorOrdersScreen } from '@screens/vendor/VendorOrdersScreen';
import { VendorSupportScreen } from '@screens/vendor/VendorSupportScreen';

export type VendorStackParamList = {
  VendorDashboard: undefined;
  VendorProducts: undefined;
  VendorOrders: undefined;
  VendorSupport: undefined;
};

const Stack = createNativeStackNavigator<VendorStackParamList>();

export const VendorStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="VendorDashboard" component={VendorDashboardScreen} />
      <Stack.Screen name="VendorProducts" component={VendorProductsScreen} />
      <Stack.Screen name="VendorOrders" component={VendorOrdersScreen} />
      <Stack.Screen name="VendorSupport" component={VendorSupportScreen} />
    </Stack.Navigator>
  );
};