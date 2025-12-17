import { useState } from 'react';
import { StyleSheet, Pressable, ActivityIndicator, View, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBiometrics, getAuthenticationTypeName } from '@/hooks/use-biometrics.web';
import { useThemeColor } from '@/hooks/use-theme-color';

export type BiometricAuthButtonProps = {
  onAuthSuccess?: (data?: { token?: string; user?: any }) => void;
  onAuthFailure?: (error: string) => void;
  buttonText?: string;
  promptMessage?: string;
  cancelLabel?: string;
  showSupportedTypes?: boolean;
  defaultEmail?: string;
  defaultUsername?: string;
};

/**
 * Web版 生体認証ボタンコンポーネント (WebAuthn使用)
 *
 * @example
 * <BiometricAuthButton
 *   onAuthSuccess={(data) => console.log('認証成功', data.token)}
 *   onAuthFailure={(error) => console.log('認証失敗:', error)}
 *   buttonText="ログイン"
 *   defaultEmail="user@example.com"
 *   defaultUsername="username"
 * />
 */
export function BiometricAuthButton({
  onAuthSuccess,
  onAuthFailure,
  buttonText = '生体認証でログイン',
  showSupportedTypes = true,
  defaultEmail = '',
  defaultUsername = '',
}: BiometricAuthButtonProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [email, setEmail] = useState(defaultEmail);
  const [username, setUsername] = useState(defaultUsername);

  const { isAvailable, isEnrolled, supportedTypes, authenticate, register, isLoading, lastEmail } =
    useBiometrics();

  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // lastEmailが存在する場合、emailフィールドのデフォルト値として使用
  const displayEmail = email || lastEmail || '';

  const handleRegister = async () => {
    setIsRegistering(true);
    setStatusMessage('');

    try {
      const result = await register(username, username);

      if (result.success) {
        setStatusMessage('✓ 生体認証の登録が完了しました');
        onAuthSuccess?.();
      } else {
        const errorMessage = result.error || '登録に失敗しました';
        setStatusMessage('✗ ' + errorMessage);
        onAuthFailure?.(errorMessage);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!isAvailable || !isEnrolled) {
      const message = !isAvailable
        ? 'このブラウザは生体認証（WebAuthn）に対応していません'
        : '生体認証が登録されていません。先に登録を行ってください';

      setStatusMessage('✗ ' + message);
      onAuthFailure?.(message);
      return;
    }

    setIsAuthenticating(true);
    setStatusMessage('');

    try {
      const result = await authenticate({ username });

      if (result.success) {
        setStatusMessage('✓ 認証に成功しました');
        onAuthSuccess?.();
      } else {
        const errorMessage = result.error || '認証に失敗しました';
        setStatusMessage('✗ ' + errorMessage);
        onAuthFailure?.(errorMessage);
      }
    } finally {
      setIsAuthenticating(false);
    }
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
        <ThemedText style={styles.warningIcon}>⚠️</ThemedText>
        <ThemedText style={styles.warningText}>
          このブラウザは生体認証（WebAuthn）に対応していません
        </ThemedText>
        <ThemedText style={styles.infoSubText}>
          Chrome、Edge、Safari、Firefoxの最新版をご利用ください
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

      {!isEnrolled ? (
        <View style={styles.enrollmentSection}>
          <ThemedText style={styles.enrollmentTitle}>初回登録が必要です</ThemedText>
          <ThemedText style={styles.enrollmentDescription}>
            生体認証を使用するには、最初に登録が必要です。
            登録後は、指紋や顔認証でログインできるようになります。
          </ThemedText>
          <Pressable
            onPress={handleRegister}
            disabled={isRegistering}
            style={({ pressed }) => [
              styles.button,
              styles.registerButton,
              { backgroundColor: '#4CAF50' },
              pressed && styles.buttonPressed,
              isRegistering && styles.buttonDisabled,
            ]}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <ThemedText style={styles.buttonIcon}>🔐</ThemedText>
                <ThemedText style={styles.buttonText}>生体認証を登録</ThemedText>
              </>
            )}
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handleAuthenticate}
          disabled={isAuthenticating}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: primaryColor },
            pressed && styles.buttonPressed,
            isAuthenticating && styles.buttonDisabled,
          ]}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <ThemedText style={styles.buttonIcon}>🔒</ThemedText>
              <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
            </>
          )}
        </Pressable>
      )}

      {statusMessage && (
        <ThemedView style={styles.statusContainer}>
          <ThemedText
            style={[
              styles.statusText,
              statusMessage.startsWith('✓') ? styles.successText : styles.errorText,
            ]}
          >
            {statusMessage}
          </ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    gap: 8,
  },
  registerButton: {
    marginTop: 12,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    fontSize: 20,
    color: '#fff',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  warningIcon: {
    fontSize: 48,
  },
  warningText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    color: '#ff9800',
    fontWeight: '600',
  },
  infoSubText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.7,
  },
  supportedTypesContainer: {
    alignItems: 'center',
    padding: 12,
    gap: 4,
  },
  supportedTypesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  supportedTypeText: {
    fontSize: 14,
    opacity: 0.8,
  },
  enrollmentSection: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
    maxWidth: 500,
  },
  enrollmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  enrollmentDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#f44336',
  },
});
