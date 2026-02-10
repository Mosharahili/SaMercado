import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthStack } from "./stacks/AuthStack";
import { CustomerTabs } from "./tabs/CustomerTabs";
import { AdminStack } from "./stacks/AdminStack";
import { VendorStack } from "./stacks/VendorStack";
import { useAuth } from "@hooks/useAuth";

export type RootStackParamList = {
  Auth: undefined;
  Customer: undefined;
  Admin: undefined;
  Vendor: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user && <Stack.Screen name="Auth" component={AuthStack} />}
      {user?.role === "CUSTOMER" && <Stack.Screen name="Customer" component={CustomerTabs} />}
      {(user?.role === "ADMIN" || user?.role === "OWNER") && (
        <Stack.Screen name="Admin" component={AdminStack} />
      )}
      {user?.role === "VENDOR" && <Stack.Screen name="Vendor" component={VendorStack} />}
    </Stack.Navigator>
  );
};

