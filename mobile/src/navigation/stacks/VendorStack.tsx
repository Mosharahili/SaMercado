import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { VendorDashboardScreen } from "@screens/vendor/VendorDashboardScreen";
import { VendorProductsScreen } from "@screens/vendor/VendorProductsScreen";
import { VendorOrdersScreen } from "@screens/vendor/VendorOrdersScreen";
import { VendorAnalyticsScreen } from "@screens/vendor/VendorAnalyticsScreen";
import { VendorSupportScreen } from "@screens/vendor/VendorSupportScreen";

export type VendorStackParamList = {
  VendorDashboard: undefined;
  VendorProducts: undefined;
  VendorOrders: undefined;
  VendorAnalytics: undefined;
  VendorSupport: undefined;
};

const Stack = createNativeStackNavigator<VendorStackParamList>();

export const VendorStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="VendorDashboard"
        component={VendorDashboardScreen}
        options={{ title: "لوحة البائع" }}
      />
      <Stack.Screen
        name="VendorProducts"
        component={VendorProductsScreen}
        options={{ title: "منتجاتي" }}
      />
      <Stack.Screen
        name="VendorOrders"
        component={VendorOrdersScreen}
        options={{ title: "طلبات العملاء" }}
      />
      <Stack.Screen
        name="VendorAnalytics"
        component={VendorAnalyticsScreen}
        options={{ title: "تحليلات" }}
      />
      <Stack.Screen
        name="VendorSupport"
        component={VendorSupportScreen}
        options={{ title: "الدعم" }}
      />
    </Stack.Navigator>
  );
};

