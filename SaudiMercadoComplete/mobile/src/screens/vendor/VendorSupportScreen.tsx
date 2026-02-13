import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { useLanguage } from '@hooks/useLanguage';

export const VendorSupportScreen = () => {
  const { isRTL, tr } = useLanguage();
  const [message, setMessage] = useState('');

  const send = () => {
    if (!message.trim()) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('أدخل رسالة الدعم أولًا', 'Please enter your support message first'));
      return;
    }
    Alert.alert(tr('تم', 'Done'), tr('تم إرسال الرسالة إلى فريق الدعم', 'Your message was sent to support team'));
    setMessage('');
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('التواصل مع الإدارة', 'Contact Admin')}</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={tr('اكتب رسالتك هنا', 'Write your message here')}
          multiline
          numberOfLines={6}
          textAlign={isRTL ? 'right' : 'left'}
          textAlignVertical="top"
        />
        <AppButton label={tr('إرسال', 'Send')} onPress={send} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 14, padding: 14, gap: 8 },
  title: { fontWeight: '900', color: '#14532d' },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    minHeight: 120,
    padding: 10,
  },
});
