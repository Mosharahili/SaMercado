import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OwnerDashboardScreen } from '@screens/admin/OwnerDashboardScreen';
import { AdminsManagementScreen } from '@screens/admin/AdminsManagementScreen';
import { AnalyticsScreen } from '@screens/admin/AnalyticsScreen';
import { BannersScreen } from '@screens/admin/BannersScreen';
import { MarketsManagementScreen } from '@screens/admin/MarketsManagementScreen';
import { OrdersManagementScreen } from '@screens/admin/OrdersManagementScreen';
import { PopupsScreen } from '@screens/admin/PopupsScreen';
import { ProductsManagementScreen } from '@screens/admin/ProductsManagementScreen';
import { SettingsScreen } from '@screens/admin/SettingsScreen';
import { VendorsManagementScreen } from '@screens/admin/VendorsManagementScreen';

export type AdminStackParamList = {
  OwnerDashboard: undefined;
  AdminsManagement: undefined;
  Analytics: undefined;
  Banners: undefined;
  MarketsManagement: undefined;
  OrdersManagement: undefined;
  Popups: undefined;
  ProductsManagement: undefined;
  Settings: undefined;
  VendorsManagement: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
      <Stack.Screen name="AdminsManagement" component={AdminsManagementScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Banners" component={BannersScreen} />
      <Stack.Screen name="MarketsManagement" component={MarketsManagementScreen} />
      <Stack.Screen name="OrdersManagement" component={OrdersManagementScreen} />
      <Stack.Screen name="Popups" component={PopupsScreen} />
      <Stack.Screen name="ProductsManagement" component={ProductsManagementScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="VendorsManagement" component={VendorsManagementScreen} />
    </Stack.Navigator>
  );
};