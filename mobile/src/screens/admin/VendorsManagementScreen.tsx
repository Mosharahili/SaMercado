import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "@api/client";
import { useAuth } from "@hooks/useAuth";
import { theme } from "@theme/theme";

interface VendorUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN" | "OWNER";
}

interface Market {
  id: string;
  name: string;
}

interface VendorRecord {
  id: string;
  displayName: string;
  description?: string | null;
  user: VendorUser;
  markets: { market: Market }[];
}

export const VendorsManagementScreen: React.FC = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [users, setUsers] = useState<VendorUser[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>([]);

  const isOwner = user?.role === "OWNER";

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vendorsRes, usersRes, marketsRes] = await Promise.all([
        api.get<VendorRecord[]>("/admin/vendors"),
        api.get<VendorUser[]>("/admin/users"),
        api.get<Market[]>("/admin/markets"),
      ]);
      setVendors(vendorsRes.data);
      setUsers(usersRes.data);
      setMarkets(marketsRes.data);
    } catch (err) {
      console.error(err);
      setError("تعذّر تحميل بيانات البائعين، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleMarket = (id: string) => {
    setSelectedMarketIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const onSelectVendor = (record: VendorRecord) => {
    setSelectedUserId(record.user.id);
    setDisplayName(record.displayName);
    setDescription(record.description ?? "");
    setSelectedMarketIds(record.markets.map((m) => m.market.id));
  };

  const onSave = async () => {
    if (!selectedUserId) {
      Alert.alert("تنبيه", "الرجاء اختيار مستخدم لإنشاء/تحديث حساب البائع.");
      return;
    }
    if (!displayName.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال اسم عرض للبائع.");
      return;
    }
    if (!isOwner) {
      Alert.alert("خطأ", "فقط المالك يمكنه إدارة البائعين.");
      return;
    }

    try {
      setSaving(true);
      const res = await api.post<VendorRecord>("/admin/vendors", {
        userId: selectedUserId,
        displayName: displayName.trim(),
        description: description.trim() || undefined,
      });

      const vendorId = res.data.id;
      // ربط الأسواق المختارة
      for (const marketId of selectedMarketIds) {
        await api.post(`/admin/markets/${marketId}/vendors`, { vendorId });
      }

      await load();
      Alert.alert("تم", "تم حفظ بيانات البائع وربطه بالأسواق المختارة.");
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر حفظ بيانات البائع، حاول مرة أخرى.");
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
      <Text style={styles.title}>إدارة البائعين</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.row}>
        <View style={styles.leftPane}>
          <Text style={styles.sectionTitle}>البائعون الحاليون</Text>
          <FlatList
            data={vendors}
            keyExtractor={(v) => v.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>لا توجد حسابات بائعين بعد.</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.vendorRow}
                onPress={() => onSelectVendor(item)}
              >
                <Text style={styles.vendorName}>{item.displayName}</Text>
                <Text style={styles.vendorMeta}>
                  {item.user.email} • {item.user.role}
                </Text>
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
                style={styles.vendorRow}
                onPress={() => {
                  setSelectedUserId(item.id);
                  setDisplayName(item.name);
                  setDescription("");
                  setSelectedMarketIds([]);
                }}
              >
                <Text style={styles.vendorName}>{item.name}</Text>
                <Text style={styles.vendorMeta}>
                  {item.email} • {item.role}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.rightPane}>
          <Text style={styles.sectionTitle}>بيانات البائع</Text>
          <Text style={styles.label}>اسم العرض</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="مثال: خيرات الرياض"
            placeholderTextColor="#9ca3af"
            textAlign="right"
          />

          <Text style={styles.label}>وصف (اختياري)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="وصف مختصر عن البائع"
            placeholderTextColor="#9ca3af"
            multiline
            textAlign="right"
          />

          <Text style={styles.sectionTitle}>الأسواق المرتبطة</Text>
          <FlatList
            data={markets}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => {
              const selected = selectedMarketIds.includes(item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.marketRow,
                    selected && styles.marketRowSelected,
                  ]}
                  onPress={() => toggleMarket(item.id)}
                >
                  <Text
                    style={[
                      styles.marketName,
                      selected && styles.marketNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>لا توجد أسواق مسجلة.</Text>
            }
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => void onSave()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveText}>حفظ بيانات البائع</Text>
            )}
          </TouchableOpacity>
        </View>
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
  row: {
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
  vendorRow: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  vendorName: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    color: theme.colors.text,
  },
  vendorMeta: {
    fontSize: 11,
    color: theme.colors.muted,
    textAlign: "right",
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    color: theme.colors.text,
  },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
    textAlign: "right",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  marketRow: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 4,
  },
  marketRowSelected: {
    backgroundColor: "#e5f9f0",
    borderColor: theme.colors.primary,
  },
  marketName: {
    fontSize: 13,
    textAlign: "right",
    color: theme.colors.text,
  },
  marketNameSelected: {
    fontWeight: "700",
    color: theme.colors.primary,
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