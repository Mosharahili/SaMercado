import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VendorStackParamList } from '../types';
import { VendorDashboardScreen } from '@screens/vendor/VendorDashboardScreen';
import { VendorProductsScreen } from '@screens/vendor/VendorProductsScreen';
import { VendorOrdersScreen } from '@screens/vendor/VendorOrdersScreen';
import { VendorAnalyticsScreen } from '@screens/vendor/VendorAnalyticsScreen';
import { VendorSupportScreen } from '@screens/vendor/VendorSupportScreen';

const Stack = createNativeStackNavigator<VendorStackParamList>();

export const VendorStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerTitleAlign: 'left',
      contentStyle: { direction: 'rtl' },
    }}
  >
    <Stack.Screen name="VendorDashboard" component={VendorDashboardScreen} options={{ title: 'بوابة البائع' }} />
    <Stack.Screen name="VendorProducts" component={VendorProductsScreen} options={{ title: 'منتجاتي' }} />
    <Stack.Screen name="VendorOrders" component={VendorOrdersScreen} options={{ title: 'طلباتي' }} />
    <Stack.Screen name="VendorAnalytics" component={VendorAnalyticsScreen} options={{ title: 'تحليلات البائع' }} />
    <Stack.Screen name="VendorSupport" component={VendorSupportScreen} options={{ title: 'دعم البائع' }} />
  </Stack.Navigator>
);
