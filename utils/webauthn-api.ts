/**
 * WebAuthn API クライアント
 * Goサーバーとの通信を行う
 */

// 環境変数からAPIベースURLを取得（デフォルトはlocalhost）
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

// タイムアウト設定（60秒）
const REQUEST_TIMEOUT = 60000;

/**
 * 登録開始のレスポンス
 */
export interface RegistrationBeginResponse {
  publicKey: PublicKeyCredentialCreationOptions;
  sessionId: string;
}

/**
 * 登録完了のリクエスト
 */
export interface RegistrationFinishRequest {
  sessionId: string;
  credential: {
    id: string;
    rawId: string;
    type: string;
    response: {
      attestationObject: string;
      clientDataJSON: string;
    };
  };
}

/**
 * 認証開始のリクエスト
 */
export interface LoginBeginRequest {
  username: string;
}

/**
 * 認証開始のレスポンス
 */
export interface LoginBeginResponse {
  publicKey: PublicKeyCredentialRequestOptions;
  sessionId: string;
}

/**
 * 認証完了のリクエスト
 */
export interface LoginFinishRequest {
  sessionId: string;
  credential: {
    id: string;
    rawId: string;
    type: string;
    response: {
      authenticatorData: string;
      clientDataJSON: string;
      signature: string;
      userHandle?: string;
    };
  };
}

/**
 * API共通レスポンス
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * ArrayBufferをBase64URL文字列に変換
 */
function bufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64URL文字列をArrayBufferに変換
 */
function base64URLToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(paddedBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * PublicKeyCredentialCreationOptionsのバイナリフィールドを変換
 */
function decodeCreationOptions(
  options: any
): PublicKeyCredentialCreationOptions {
  return {
    ...options,
    challenge: base64URLToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64URLToBuffer(options.user.id),
    },
    excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    })),
  };
}

/**
 * PublicKeyCredentialRequestOptionsのバイナリフィールドを変換
 */
function decodeRequestOptions(
  options: any
): PublicKeyCredentialRequestOptions {
  return {
    ...options,
    challenge: base64URLToBuffer(options.challenge),
    allowCredentials: options.allowCredentials?.map((cred: any) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    })),
  };
}

/**
 * WebAuthn登録を開始（チャレンジを取得）
 */
export async function beginRegistration(
  email: string,
  username: string
): Promise<RegistrationBeginResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register/begin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        username,
      }),
      credentials: 'include',
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'ネットワークエラー' }));
      throw new Error(error.error || error.message || '登録開始に失敗しました');
    }

    const data: ApiResponse<any> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || '登録開始に失敗しました');
    }

    return {
      publicKey: decodeCreationOptions(data.data.publicKey),
      sessionId: data.data.sessionId,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * WebAuthn登録を完了（credentialをサーバーに送信）
 */
export async function finishRegistration(
  sessionId: string,
  credential: PublicKeyCredential
): Promise<{ token?: string; user?: any }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = credential.response as AuthenticatorAttestationResponse;

    const requestData: RegistrationFinishRequest = {
      sessionId,
      credential: {
        id: credential.id,
        rawId: bufferToBase64URL(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64URL(response.attestationObject),
          clientDataJSON: bufferToBase64URL(response.clientDataJSON),
        },
      },
    };

    const apiResponse = await fetch(`${API_BASE_URL}/api/v1/auth/register/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      credentials: 'include',
      signal: controller.signal,
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json().catch(() => ({ error: 'ネットワークエラー' }));
      throw new Error(error.error || error.message || '登録完了に失敗しました');
    }

    const data: ApiResponse<any> = await apiResponse.json();

    if (!data.success) {
      throw new Error(data.error || '登録完了に失敗しました');
    }

    return data.data || {};
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * WebAuthn認証を開始（チャレンジを取得）
 */
export async function beginLogin(email: string): Promise<LoginBeginResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/begin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include',
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'ネットワークエラー' }));
      throw new Error(error.error || error.message || '認証開始に失敗しました');
    }

    const data: ApiResponse<any> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || '認証開始に失敗しました');
    }

    return {
      publicKey: decodeRequestOptions(data.data.publicKey),
      sessionId: data.data.sessionId,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * WebAuthn認証を完了（assertionをサーバーに送信）
 */
export async function finishLogin(
  sessionId: string,
  credential: PublicKeyCredential
): Promise<{ token?: string; user?: any }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = credential.response as AuthenticatorAssertionResponse;

    const requestData: LoginFinishRequest = {
      sessionId,
      credential: {
        id: credential.id,
        rawId: bufferToBase64URL(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: bufferToBase64URL(response.authenticatorData),
          clientDataJSON: bufferToBase64URL(response.clientDataJSON),
          signature: bufferToBase64URL(response.signature),
          userHandle: response.userHandle ? bufferToBase64URL(response.userHandle) : undefined,
        },
      },
    };

    const apiResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      credentials: 'include',
      signal: controller.signal,
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json().catch(() => ({ error: 'ネットワークエラー' }));
      throw new Error(error.error || error.message || '認証完了に失敗しました');
    }

    const data: ApiResponse<any> = await apiResponse.json();

    if (!data.success) {
      throw new Error(data.error || '認証完了に失敗しました');
    }

    return data.data || {};
  } finally {
    clearTimeout(timeoutId);
  }
}
