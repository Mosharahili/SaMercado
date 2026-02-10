import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "@api/client";
import { useAuth, PermissionKey } from "@hooks/useAuth";
import { theme } from "@theme/theme";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "OWNER" | "VENDOR" | "CUSTOMER";
  permissions: { key: PermissionKey }[];
}

interface AdminRecord {
  id: string;
  user: AdminUser;
}

const ALL_PERMISSIONS: { key: PermissionKey; label: string }[] = [
  { key: "MANAGE_BANNERS", label: "إدارة البنرات" },
  { key: "MANAGE_POPUPS", label: "إدارة النوافذ المنبثقة" },
  { key: "MANAGE_MARKETS", label: "إدارة الأسواق" },
  { key: "MANAGE_VENDORS", label: "إدارة البائعين" },
  { key: "MANAGE_PRODUCTS", label: "إدارة المنتجات" },
  { key: "VIEW_ANALYTICS", label: "عرض التحليلات" },
  { key: "MANAGE_ORDERS", label: "إدارة الطلبات" },
  { key: "MANAGE_USERS", label: "إدارة المستخدمين" },
  { key: "MANAGE_PAYMENTS", label: "إدارة المدفوعات" },
  { key: "SEND_NOTIFICATIONS", label: "إرسال الإشعارات" },
];

export const AdminsManagementScreen: React.FC = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);

  const isOwner = user?.role === "OWNER";

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [adminsRes, usersRes] = await Promise.all([
        api.get<AdminRecord[]>("/admin/admins"),
        api.get<AdminUser[]>("/admin/users"),
      ]);
      setAdmins(adminsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      setError("تعذّر تحميل بيانات المدراء والمستخدمين، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (perm: PermissionKey) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const onSelectAdmin = (record: AdminRecord) => {
    setSelectedUserId(record.user.id);
    setSelectedPermissions(record.user.permissions.map((p) => p.key));
  };

  const onSave = async () => {
    if (!selectedUserId) {
      Alert.alert("تنبيه", "الرجاء اختيار مستخدم لتعيينه كمدير.");
      return;
    }
    if (!isOwner) {
      Alert.alert("خطأ", "فقط المالك يمكنه إدارة المدراء والصلاحيات.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/admin/admins", {
        userId: selectedUserId,
        permissions: selectedPermissions,
      });
      await load();
      Alert.alert("تم", "تم تحديث صلاحيات الأدمن بنجاح.");
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر حفظ الصلاحيات، حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOwner) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>هذه الصفحة متاحة للمالك فقط.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إدارة المدراء والصلاحيات</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.sectionRow}>
        <View style={styles.leftPane}>
          <Text style={styles.sectionTitle}>المدراء الحاليون</Text>
          <FlatList
            data={admins}
            keyExtractor={(a) => a.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>لا توجد حسابات أدمن بعد.</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.adminRow,
                  selectedUserId === item.user.id && styles.adminRowSelected,
                ]}
                onPress={() => onSelectAdmin(item)}
              >
                <Text style={styles.adminName}>{item.user.name}</Text>
                <Text style={styles.adminEmail}>{item.user.email}</Text>
              </TouchableOpacity>
            )}
          />

          <Text style={styles.sectionTitle}>المستخدمون</Text>
          <FlatList
            data={users}
            keyExtractor={(u) => u.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>لا توجد حسابات مستخدمين.</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userRow,
                  selectedUserId === item.id && styles.adminRowSelected,
                ]}
                onPress={() => {
                  setSelectedUserId(item.id);
                  setSelectedPermissions(item.permissions.map((p) => p.key));
                }}
              >
                <Text style={styles.adminName}>{item.name}</Text>
                <Text style={styles.adminEmail}>
                  {item.email} • {item.role}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <ScrollView style={styles.rightPane} contentContainerStyle={{ paddingBottom: 16 }}>
          <Text style={styles.sectionTitle}>الصلاحيات</Text>
          {ALL_PERMISSIONS.map((perm) => (
            <TouchableOpacity
              key={perm.key}
              style={styles.permissionRow}
              onPress={() => togglePermission(perm.key)}
            >
              <View
                style={[
                  styles.checkbox,
                  selectedPermissions.includes(perm.key) && styles.checkboxChecked,
                ]}
              >
                {selectedPermissions.includes(perm.key) && (
                  <Text style={styles.checkboxMark}>✓</Text>
                )}
              </View>
              <Text style={styles.permissionLabel}>{perm.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => void onSave()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveText}>حفظ الصلاحيات</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 8,
  },
  errorText: {
    color: theme.colors.error ?? "#dc2626",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "right",
  },
  sectionRow: {
    flex: 1,
    flexDirection: "row-reverse",
  },
  leftPane: {
    flex: 1,
    marginLeft: 8,
  },
  rightPane: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 4,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: "right",
    marginVertical: 4,
  },
  adminRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  adminRowSelected: {
    backgroundColor: "#e5f9f0",
  },
  adminName: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    color: theme.colors.text,
  },
  adminEmail: {
    fontSize: 11,
    color: theme.colors.muted,
    textAlign: "right",
  },
  userRow: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  permissionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxMark: {
    color: "#ffffff",
    fontSize: 12,
  },
  permissionLabel: {
    fontSize: 13,
    color: theme.colors.text,
    textAlign: "right",
    flex: 1,
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});