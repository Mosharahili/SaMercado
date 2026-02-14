import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@hooks/useLanguage';
import { theme } from '@theme/theme';

export const AppButton = ({
  label,
  onPress,
  loading,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
}) => {
  const handlePress = React.useCallback(() => {
    if (!loading && onPress) {
      onPress();
    }
  }, [loading, onPress]);

  const content = (
    <Pressable 
      onPress={handlePress} 
      disabled={loading} 
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressableActive
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? theme.colors.primary : '#fff'} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'ghost' && styles.ghostLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );

  if (variant === 'ghost') {
    return <View style={styles.ghost}>{content}</View>;
  }

  return (
    <LinearGradient colors={theme.gradients.card} style={styles.primary}>
      {content}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  primary: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  ghost: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#86efac',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  pressable: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  pressableActive: {
    opacity: 0.8,
  },
  label: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  ghostLabel: {
    color: '#166534',
  },
});
