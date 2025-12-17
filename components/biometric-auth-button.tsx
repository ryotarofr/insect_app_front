import { useState } from 'react';
import {
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  type PressableProps,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBiometrics, getAuthenticationTypeName } from '@/hooks/use-biometrics';
import { useThemeColor } from '@/hooks/use-theme-color';

export type BiometricAuthButtonProps = Omit<PressableProps, 'onPress'> & {
  onAuthSuccess?: () => void;
  onAuthFailure?: (error: string) => void;
  buttonText?: string;
  promptMessage?: string;
  cancelLabel?: string;
  showSupportedTypes?: boolean;
};

/**
 * 生体認証ボタンコンポーネント
 *
 * @example
 * <BiometricAuthButton
 *   onAuthSuccess={() => console.log('認証成功')}
 *   onAuthFailure={(error) => console.log('認証失敗:', error)}
 *   buttonText="ログイン"
 * />
 */
export function BiometricAuthButton({
  onAuthSuccess,
  onAuthFailure,
  buttonText = '生体認証でログイン',
  promptMessage = '認証してください',
  cancelLabel = 'キャンセル',
  showSupportedTypes = true,
  ...pressableProps
}: BiometricAuthButtonProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { isAvailable, isEnrolled, supportedTypes, authenticate, isLoading } = useBiometrics();

  const primaryColor = useThemeColor({}, 'tint');

  const handleAuthenticate = async () => {
    if (!isAvailable || !isEnrolled) {
      const message = !isAvailable
        ? 'このデバイスは生体認証に対応していません'
        : '生体認証が登録されていません。デバイスの設定から登録してください';

      Alert.alert('生体認証が利用できません', message);
      onAuthFailure?.(message);
      return;
    }

    setIsAuthenticating(true);

    try {
      const result = await authenticate({
        promptMessage,
        cancelLabel,
        disableDeviceFallback: false
      });

      if (result.success) {
        onAuthSuccess?.();
      } else {
        const errorMessage = result.error || '認証に失敗しました';
        Alert.alert('認証失敗', errorMessage);
        onAuthFailure?.(errorMessage);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricIcon = () => {
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'scan-outline';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'finger-print-outline';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'eye-outline';
    }
    return 'shield-checkmark-outline';
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>生体認証を確認中...</ThemedText>
      </ThemedView>
    );
  }

  if (!isAvailable) {
    return (
      <ThemedView style={styles.container}>
        <Ionicons name="warning-outline" size={48} color="#ff9800" />
        <ThemedText style={styles.warningText}>
          このデバイスは生体認証に対応していません
        </ThemedText>
      </ThemedView>
    );
  }

  if (!isEnrolled) {
    return (
      <ThemedView style={styles.container}>
        <Ionicons name="information-circle-outline" size={48} color="#2196f3" />
        <ThemedText style={styles.infoText}>
          生体認証が登録されていません
        </ThemedText>
        <ThemedText style={styles.infoSubText}>
          デバイスの設定から登録してください
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.wrapper}>
      {showSupportedTypes && supportedTypes.length > 0 && (
        <View style={styles.supportedTypesContainer}>
          <ThemedText style={styles.supportedTypesLabel}>利用可能な認証:</ThemedText>
          {supportedTypes.map((type, index) => (
            <ThemedText key={index} style={styles.supportedTypeText}>
              • {getAuthenticationTypeName(type)}
            </ThemedText>
          ))}
        </View>
      )}

      <Pressable
        onPress={handleAuthenticate}
        disabled={isAuthenticating}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: primaryColor },
          pressed && styles.buttonPressed,
          isAuthenticating && styles.buttonDisabled
        ]}
        {...pressableProps}
      >
        {isAuthenticating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons
              name={getBiometricIcon() as any}
              size={24}
              color="#fff"
              style={styles.icon}
            />
            <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 16
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    gap: 8
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  icon: {
    marginRight: 4
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8
  },
  warningText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    color: '#ff9800'
  },
  infoText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600'
  },
  infoSubText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.7
  },
  supportedTypesContainer: {
    alignItems: 'center',
    padding: 12,
    gap: 4
  },
  supportedTypesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  supportedTypeText: {
    fontSize: 14,
    opacity: 0.8
  }
});
