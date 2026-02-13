import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useLanguage } from '@hooks/useLanguage';
import { AdminStackParamList } from '../types';
import { AdminDashboardScreen } from '@screens/admin/AdminDashboardScreen';
import { AdminMarketsScreen } from '@screens/admin/AdminMarketsScreen';
import { AdminProductsScreen } from '@screens/admin/AdminProductsScreen';
import { AdminOrdersScreen } from '@screens/admin/AdminOrdersScreen';
import { AdminUsersScreen } from '@screens/admin/AdminUsersScreen';
import { MarketsScreen } from '@screens/customer/MarketsScreen';
import { ProductsScreen } from '@screens/customer/ProductsScreen';
import { CartScreen } from '@screens/customer/CartScreen';
import { AccountScreen } from '@screens/customer/AccountScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminStack = () => {
  const { isRTL, tr } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        contentStyle: { direction: isRTL ? 'rtl' : 'ltr' },
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: tr('لوحة الأدمن', 'Admin Panel') }} />
      <Stack.Screen name="AdminStoreMarkets" component={MarketsScreen} options={{ title: tr('الأسواق', 'Markets') }} />
      <Stack.Screen name="AdminStoreProducts" component={ProductsScreen} options={{ title: tr('المنتجات', 'Products') }} />
      <Stack.Screen name="AdminStoreCart" component={CartScreen} options={{ title: tr('السلة', 'Cart') }} />
      <Stack.Screen name="AdminStoreAccount" component={AccountScreen} options={{ title: tr('الحساب', 'Account') }} />
      <Stack.Screen name="AdminMarkets" component={AdminMarketsScreen} options={{ title: tr('إدارة الأسواق', 'Manage Markets') }} />
      <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: tr('إدارة المنتجات', 'Manage Products') }} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: tr('إدارة الطلبات', 'Manage Orders') }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: tr('إدارة المستخدمين', 'Manage Users') }} />
    </Stack.Navigator>
  );
};
