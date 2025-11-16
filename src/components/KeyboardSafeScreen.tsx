import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const KeyboardSafeScreen: React.FC<Props> = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  // This tells iOS how far to shift content when the keyboard appears.
  // Header height is usually ~56; adjust if your headers are taller/shorter.
  const keyboardOffset = insets.top + 56;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'left', 'bottom']}>
      <KeyboardAvoidingView
        style={[styles.flex, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardOffset : 0}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});
