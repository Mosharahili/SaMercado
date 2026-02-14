import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';

/** Wraps children with RTL-aware layout. Use for containers that should flip direction with language. */
export const RTLView = ({
  children,
  style,
  row,
  ...props
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  row?: boolean;
} & React.ComponentProps<typeof View>) => {
  const { isRTL } = useLanguage();
  const directionStyle: ViewStyle = {
    ...(row && { }),
  };
  return (
    <View style={[directionStyle, style]} {...props}>
      {children}
    </View>
  );
};
