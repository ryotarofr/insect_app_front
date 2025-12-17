import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricsResult {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  authenticate: (options?: LocalAuthentication.LocalAuthenticationOptions) => Promise<BiometricsAuthResult>;
  isLoading: boolean;
}

interface BiometricsAuthResult {
  success: boolean;
  error?: string;
}

/**
 * 生体認証を管理するカスタムフック
 *
 * @returns {BiometricsResult} 生体認証の状態と認証関数
 *
 * @example
 * const { isAvailable, authenticate, supportedTypes } = useBiometrics();
 *
 * if (isAvailable) {
 *   const result = await authenticate();
 *   if (result.success) {
 *     // 認証成功
 *   }
 * }
 */
export function useBiometrics(): BiometricsResult {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<LocalAuthentication.AuthenticationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  /**
   * デバイスの生体認証サポート状況をチェック
   */
  const checkBiometricSupport = async () => {
    try {
      setIsLoading(true);

      // ハードウェアサポートの確認
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(compatible);

      if (compatible) {
        // 登録済みの生体認証があるかチェック
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        // サポートされている認証タイプを取得
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setSupportedTypes(types);
      }
    } catch (error) {
      console.error('生体認証のチェックに失敗しました:', error);
      setIsAvailable(false);
      setIsEnrolled(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 生体認証を実行
   *
   * @param options - LocalAuthenticationのオプション
   * @returns {Promise<BiometricsAuthResult>} 認証結果
   */
  const authenticate = async (
    options?: LocalAuthentication.LocalAuthenticationOptions
  ): Promise<BiometricsAuthResult> => {
    try {
      if (!isAvailable) {
        return {
          success: false,
          error: 'このデバイスは生体認証に対応していません'
        };
      }

      if (!isEnrolled) {
        return {
          success: false,
          error: '生体認証が登録されていません。デバイスの設定から登録してください'
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '認証してください',
        cancelLabel: 'キャンセル',
        disableDeviceFallback: false,
        ...options
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || '認証に失敗しました'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '認証中にエラーが発生しました'
      };
    }
  };

  return {
    isAvailable,
    isEnrolled,
    supportedTypes,
    authenticate,
    isLoading
  };
}

/**
 * サポートされている認証タイプを人間が読める形式に変換
 */
export function getAuthenticationTypeName(type: LocalAuthentication.AuthenticationType): string {
  switch (type) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return '指紋認証';
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return '顔認証';
    case LocalAuthentication.AuthenticationType.IRIS:
      return '虹彩認証';
    default:
      return '不明';
  }
}
