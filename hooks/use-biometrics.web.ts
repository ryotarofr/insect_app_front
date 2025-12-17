import { useState, useEffect } from 'react';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  registerWebAuthnCredential,
  authenticateWebAuthn,
  getLastEmail,
} from '@/utils/webauthn';

interface BiometricsResult {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: WebAuthnAuthenticationType[];
  authenticate: (options?: WebAuthnAuthenticationOptions) => Promise<BiometricsAuthResult>;
  register: (email: string, username: string) => Promise<BiometricsAuthResult>;
  isLoading: boolean;
  lastEmail: string | null;
}

interface BiometricsAuthResult {
  success: boolean;
  error?: string;
  token?: string;
  user?: any;
}

interface WebAuthnAuthenticationOptions {
  promptMessage?: string;
  cancelLabel?: string;
  email?: string;
}

export enum WebAuthnAuthenticationType {
  PLATFORM = 1, // 生体認証（指紋、顔認証など）
  SECURITY_KEY = 2, // セキュリティキー
}

/**
 * Web版の生体認証を管理するカスタムフック (WebAuthn使用)
 * サーバーAPIと連携して動作します
 *
 * @returns {BiometricsResult} 生体認証の状態と認証関数
 *
 * @example
 * const { isAvailable, register, authenticate, lastEmail } = useBiometrics();
 *
 * // 初回登録
 * if (isAvailable) {
 *   await register('user@example.com', 'username');
 * }
 *
 * // 認証
 * if (isAvailable) {
 *   const result = await authenticate({ email: 'user@example.com' });
 *   if (result.success) {
 *     // 認証成功、result.tokenを使ってログイン
 *   }
 * }
 */
export function useBiometrics(): BiometricsResult {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<WebAuthnAuthenticationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastEmail, setLastEmail] = useState<string | null>(null);

  useEffect(() => {
    checkWebAuthnSupport();
  }, []);

  /**
   * WebAuthnのサポート状況をチェック
   */
  const checkWebAuthnSupport = async () => {
    try {
      setIsLoading(true);

      // WebAuthnサポートの確認
      const supported = isWebAuthnSupported();

      if (!supported) {
        setIsAvailable(false);
        setIsEnrolled(false);
        return;
      }

      // プラットフォーム認証器（生体認証）の確認
      const platformAvailable = await isPlatformAuthenticatorAvailable();
      setIsAvailable(platformAvailable);

      if (platformAvailable) {
        setSupportedTypes([WebAuthnAuthenticationType.PLATFORM]);

        // 最後に使用したEmailを取得
        const email = getLastEmail();
        setLastEmail(email);

        // Emailが保存されている場合は、登録済みとみなす
        // 実際のサーバー確認はログイン時に行われる
        setIsEnrolled(!!email);
      }
    } catch (error) {
      console.error('WebAuthnのチェックに失敗しました:', error);
      setIsAvailable(false);
      setIsEnrolled(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * WebAuthn認証情報を登録
   *
   * @param email - ユーザーのEmail（識別子）
   * @param username - ユーザー名
   * @returns {Promise<BiometricsAuthResult>} 登録結果
   */
  const register = async (
    email: string,
    username: string
  ): Promise<BiometricsAuthResult> => {
    if (!email || !username) {
      return {
        success: false,
        error: 'EmailとUsernameを入力してください'
      };
    }

    if (!isAvailable) {
      return {
        success: false,
        error: 'このブラウザは生体認証（WebAuthn）に対応していません'
      };
    }

    try {
      const result = await registerWebAuthnCredential(email, username);

      if (result.success) {
        setIsEnrolled(true);
        setLastEmail(email);
        return {
          success: true,
          token: result.token,
          user: result.user
        };
      } else {
        return {
          success: false,
          error: result.error || '登録に失敗しました'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登録中にエラーが発生しました';

      // ユーザーがキャンセルした場合
      if (errorMessage.includes('cancelled') || errorMessage.includes('abort')) {
        return {
          success: false,
          error: '登録がキャンセルされました'
        };
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * WebAuthnで認証を実行
   *
   * @param options - 認証オプション
   * @returns {Promise<BiometricsAuthResult>} 認証結果
   */
  const authenticate = async (
    options?: WebAuthnAuthenticationOptions
  ): Promise<BiometricsAuthResult> => {
    const email = options?.email || lastEmail;

    if (!email) {
      return {
        success: false,
        error: 'Emailが指定されていません'
      };
    }

    if (!isAvailable) {
      return {
        success: false,
        error: 'このブラウザは生体認証（WebAuthn）に対応していません'
      };
    }

    try {
      const result = await authenticateWebAuthn(email);

      if (result.success) {
        setLastEmail(email);
        return {
          success: true,
          token: result.token,
          user: result.user
        };
      } else {
        return {
          success: false,
          error: result.error || '認証に失敗しました'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '認証中にエラーが発生しました';

      // ユーザーがキャンセルした場合
      if (errorMessage.includes('cancelled') || errorMessage.includes('abort')) {
        return {
          success: false,
          error: '認証がキャンセルされました'
        };
      }

      // タイムアウトの場合
      if (errorMessage.includes('timeout')) {
        return {
          success: false,
          error: '認証がタイムアウトしました'
        };
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  return {
    isAvailable,
    isEnrolled,
    supportedTypes,
    authenticate,
    register,
    isLoading,
    lastEmail,
  };
}

/**
 * サポートされている認証タイプを人間が読める形式に変換
 */
export function getAuthenticationTypeName(type: WebAuthnAuthenticationType): string {
  switch (type) {
    case WebAuthnAuthenticationType.PLATFORM:
      return '生体認証（指紋・顔認証など）';
    case WebAuthnAuthenticationType.SECURITY_KEY:
      return 'セキュリティキー';
    default:
      return '不明';
  }
}
