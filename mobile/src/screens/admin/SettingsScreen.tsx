import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface AppSettings {
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  deliveryFee: number;
  taxRate: number;
}

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get<AppSettings | null>("/settings");
        if (mounted && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await api.put("/settings", {
        appName: settings.appName,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        deliveryFee: Number(settings.deliveryFee),
        taxRate: Number(settings.taxRate),
      });
      Alert.alert("تم الحفظ", "تم تحديث إعدادات التطبيق بنجاح");
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر حفظ الإعدادات، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>إعدادات النظام</Text>

      <Text style={styles.label}>اسم التطبيق</Text>
      <TextInput
        style={styles.input}
        value={settings.appName}
        onChangeText={(v) => setSettings({ ...settings, appName: v })}
      />

      <Text style={styles.label}>اللون الأساسي</Text>
      <TextInput
        style={styles.input}
        value={settings.primaryColor}
        onChangeText={(v) => setSettings({ ...settings, primaryColor: v })}
      />

      <Text style={styles.label}>اللون الثانوي</Text>
      <TextInput
        style={styles.input}
        value={settings.secondaryColor}
        onChangeText={(v) => setSettings({ ...settings, secondaryColor: v })}
      />

      <Text style={styles.label}>رسوم التوصيل (ريال)</Text>
      <TextInput
        style={styles.input}
        value={String(settings.deliveryFee ?? 0)}
        keyboardType="numeric"
        onChangeText={(v) => setSettings({ ...settings, deliveryFee: Number(v) || 0 })}
      />

      <Text style={styles.label}>نسبة الضريبة (%)</Text>
      <TextInput
        style={styles.input}
        value={String(settings.taxRate ?? 0)}
        keyboardType="numeric"
        onChangeText={(v) => setSettings({ ...settings, taxRate: Number(v) || 0 })}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  label: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    color: theme.colors.text,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: "right",
    backgroundColor: "#ffffff",
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  saveText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

