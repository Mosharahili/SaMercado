import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';

export const VendorSupportScreen = () => {
  const [message, setMessage] = useState('');

  const send = () => {
    if (!message.trim()) {
      Alert.alert('تنبيه', 'أدخل رسالة الدعم أولًا');
      return;
    }
    Alert.alert('تم', 'تم إرسال الرسالة إلى فريق الدعم');
    setMessage('');
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>التواصل مع الإدارة</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="اكتب رسالتك هنا"
          multiline
          numberOfLines={6}
          textAlign="right"
          textAlignVertical="top"
        />
        <AppButton label="إرسال" onPress={send} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 14, padding: 14, gap: 8 },
  title: { textAlign: 'right', fontWeight: '900', color: '#14532d' },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    minHeight: 120,
    padding: 10,
  },
});
