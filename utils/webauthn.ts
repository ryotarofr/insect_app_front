/**
 * WebAuthn認証のユーティリティ関数
 * サーバーAPIと連携して動作します
 */

import {
  beginRegistration,
  finishRegistration,
  beginLogin,
  finishLogin,
} from './webauthn-api';

/**
 * ブラウザがWebAuthnをサポートしているかチェック
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
}

/**
 * プラットフォーム認証器（生体認証など）が利用可能かチェック
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.error('Platform authenticator check failed:', error);
    return false;
  }
}

/**
 * WebAuthn認証情報を登録
 */
export async function registerWebAuthnCredential(
  email: string,
  username: string
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  if (!isWebAuthnSupported()) {
    return {
      success: false,
      error: 'WebAuthnはこのブラウザではサポートされていません'
    };
  }

  try {
    // 1. サーバーから登録用のチャレンジを取得
    const beginResponse = await beginRegistration(email, username);

    // 2. ブラウザで認証情報を生成
    const credential = (await navigator.credentials.create({
      publicKey: beginResponse.publicKey,
    })) as PublicKeyCredential;

    if (!credential) {
      return {
        success: false,
        error: '認証情報の生成に失敗しました'
      };
    }

    // 3. サーバーに認証情報を送信して検証・保存
    const result = await finishRegistration(beginResponse.sessionId, credential);

    // 4. ローカルストレージにemailを保存（次回のログインで使用）
    saveLastEmail(email);

    return {
      success: true,
      token: result.token,
      user: result.user
    };
  } catch (error) {
    console.error('WebAuthn registration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '登録中にエラーが発生しました'
    };
  }
}

/**
 * WebAuthnで認証を実行
 */
export async function authenticateWebAuthn(
  email: string
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  if (!isWebAuthnSupported()) {
    return {
      success: false,
      error: 'WebAuthnはこのブラウザではサポートされていません'
    };
  }

  try {
    // 1. サーバーから認証用のチャレンジを取得
    const beginResponse = await beginLogin(email);

    // 2. ブラウザで署名を生成
    const credential = (await navigator.credentials.get({
      publicKey: beginResponse.publicKey,
    })) as PublicKeyCredential;

    if (!credential) {
      return {
        success: false,
        error: '認証に失敗しました'
      };
    }

    // 3. サーバーに署名を送信して検証
    const result = await finishLogin(beginResponse.sessionId, credential);

    // 4. ローカルストレージにemailを保存
    saveLastEmail(email);

    return {
      success: true,
      token: result.token,
      user: result.user
    };
  } catch (error) {
    console.error('WebAuthn authentication failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '認証中にエラーが発生しました'
    };
  }
}

/**
 * 最後に使用したEmailをローカルストレージに保存
 */
export function saveLastEmail(email: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('webauthn_last_email', email);
  } catch (error) {
    console.error('Failed to save last email:', error);
  }
}

/**
 * 最後に使用したEmailをローカルストレージから取得
 */
export function getLastEmail(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('webauthn_last_email');
  } catch (error) {
    console.error('Failed to get last email:', error);
    return null;
  }
}

/**
 * 保存されたEmailを削除
 */
export function clearLastEmail(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('webauthn_last_email');
  } catch (error) {
    console.error('Failed to clear last email:', error);
  }
}
