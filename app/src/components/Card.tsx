import React from 'react';
import { View, ViewProps } from 'react-native';
import { C } from '../ui/theme';

export const Card: React.FC<ViewProps> = ({ style, children, ...rest }) => {
  return (
    <View
      {...rest}
      style={[{
        backgroundColor: C.card,
        borderRadius: C.r.lg,
        borderWidth: 1, borderColor: C.line,
        padding: C.sp(2),
      }, style]}
    >
      {children}
    </View>
  );
};
