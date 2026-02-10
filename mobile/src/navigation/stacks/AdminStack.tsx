import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OwnerDashboardScreen } from "@screens/admin/OwnerDashboardScreen";
import { BannersScreen } from "@screens/admin/BannersScreen";
import { PopupsScreen } from "@screens/admin/PopupsScreen";
import { MarketsManagementScreen } from "@screens/admin/MarketsManagementScreen";
import { VendorsManagementScreen } from "@screens/admin/VendorsManagementScreen";
import { ProductsManagementScreen } from "@screens/admin/ProductsManagementScreen";
import { OrdersManagementScreen } from "@screens/admin/OrdersManagementScreen";
import { AnalyticsScreen } from "@screens/admin/AnalyticsScreen";
import { SettingsScreen } from "@screens/admin/SettingsScreen";
import { AdminsManagementScreen } from "@screens/admin/AdminsManagementScreen";

export type AdminStackParamList = {
  OwnerDashboard: undefined;
  Banners: undefined;
  Popups: undefined;
  Markets: undefined;
  Vendors: undefined;
  Products: undefined;
  Orders: undefined;
  Analytics: undefined;
  Settings: undefined;
  Admins: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OwnerDashboard"
        component={OwnerDashboardScreen}
        options={{ title: "لوحة التحكم" }}
      />
      <Stack.Screen name="Banners" component={BannersScreen} options={{ title: "البنرات" }} />
      <Stack.Screen name="Popups" component={PopupsScreen} options={{ title: "النوافذ المنبثقة" }} />
      <Stack.Screen name="Markets" component={MarketsManagementScreen} options={{ title: "الأسواق" }} />
      <Stack.Screen name="Vendors" component={VendorsManagementScreen} options={{ title: "البائعون" }} />
      <Stack.Screen name="Products" component={ProductsManagementScreen} options={{ title: "المنتجات" }} />
      <Stack.Screen name="Orders" component={OrdersManagementScreen} options={{ title: "الطلبات" }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: "التحليلات" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "الإعدادات" }} />
      <Stack.Screen name="Admins" component={AdminsManagementScreen} options={{ title: "المدراء" }} />
    </Stack.Navigator>
  );
};

