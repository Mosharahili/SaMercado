import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useLanguage } from '@hooks/useLanguage';
import { VendorStackParamList } from '../types';
import { VendorDashboardScreen } from '@screens/vendor/VendorDashboardScreen';
import { VendorProductsScreen } from '@screens/vendor/VendorProductsScreen';
import { VendorOrdersScreen } from '@screens/vendor/VendorOrdersScreen';
import { VendorAnalyticsScreen } from '@screens/vendor/VendorAnalyticsScreen';
import { VendorSupportScreen } from '@screens/vendor/VendorSupportScreen';

const Stack = createNativeStackNavigator<VendorStackParamList>();

export const VendorStack = () => {
  const { isRTL, tr } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        contentStyle: { direction: isRTL ? 'rtl' : 'ltr' },
      }}
    >
      <Stack.Screen name="VendorDashboard" component={VendorDashboardScreen} options={{ title: tr('بوابة البائع', 'Vendor Portal') }} />
      <Stack.Screen name="VendorProducts" component={VendorProductsScreen} options={{ title: tr('منتجاتي', 'My Products') }} />
      <Stack.Screen name="VendorOrders" component={VendorOrdersScreen} options={{ title: tr('طلباتي', 'My Orders') }} />
      <Stack.Screen name="VendorAnalytics" component={VendorAnalyticsScreen} options={{ title: tr('تحليلات البائع', 'Vendor Analytics') }} />
      <Stack.Screen name="VendorSupport" component={VendorSupportScreen} options={{ title: tr('دعم البائع', 'Vendor Support') }} />
    </Stack.Navigator>
  );
};
