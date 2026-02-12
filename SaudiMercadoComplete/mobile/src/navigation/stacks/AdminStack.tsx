import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

export const AdminStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerTitleAlign: 'left',
      contentStyle: { direction: 'rtl' },
    }}
  >
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'لوحة الأدمن' }} />
    <Stack.Screen name="AdminStoreMarkets" component={MarketsScreen} options={{ title: 'الأسواق' }} />
    <Stack.Screen name="AdminStoreProducts" component={ProductsScreen} options={{ title: 'المنتجات' }} />
    <Stack.Screen name="AdminStoreCart" component={CartScreen} options={{ title: 'السلة' }} />
    <Stack.Screen name="AdminStoreAccount" component={AccountScreen} options={{ title: 'الحساب' }} />
    <Stack.Screen name="AdminMarkets" component={AdminMarketsScreen} options={{ title: 'إدارة الأسواق' }} />
    <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: 'إدارة المنتجات' }} />
    <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: 'إدارة الطلبات' }} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'إدارة المستخدمين' }} />
  </Stack.Navigator>
);
