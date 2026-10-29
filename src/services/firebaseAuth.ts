import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  type User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive scope
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory access token cache (MANDATORY: Never in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Tải script Google Identity Services (GSI) nếu chưa có
 */
function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google?.accounts?.oauth2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Không thể tải Google Identity Services')));
      // Nếu đã tải xong trước khi gắn listener
      if ((window as any).google?.accounts?.oauth2) {
        resolve();
      }
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Không thể tải Google Identity Services'));
    document.head.appendChild(script);
  });
}

/**
 * Đăng nhập trực tiếp bằng Google Identity Services Token Client
 * Hoạt động trơn tru dựa trên OAuth Client ID mà không bị chặn bởi auth/unauthorized-domain của Firebase
 */
async function signInWithGoogleIdentity(): Promise<{ token: string; user: any }> {
  await loadGsiScript();
  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services chưa sẵn sàng');
  }

  const clientId = firebaseConfig.oAuthClientId;
  if (!clientId) {
    throw new Error('Chưa cấu hình OAuth Client ID trong firebase-applet-config.json');
  }

  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }
        const accessToken = tokenResponse.access_token;
        try {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const profile = userinfoRes.ok ? await userinfoRes.json() : {};
          const mockUser = {
            uid: profile.sub || 'google-user',
            displayName: profile.name || profile.email || 'Google User',
            email: profile.email || '',
            photoURL: profile.picture || null,
          };
          cachedAccessToken = accessToken;
          resolve({ token: accessToken, user: mockUser });
        } catch {
          cachedAccessToken = accessToken;
          resolve({
            token: accessToken,
            user: {
              uid: 'google-user',
              displayName: 'Google User',
              email: '',
              photoURL: null,
            },
          });
        }
      },
      error_callback: (err: any) => {
        reject(err);
      },
    });

    tokenClient.requestAccessToken({ prompt: 'select_account' });
  });
}

export const googleSignIn = async (): Promise<{ user: any; accessToken: string }> => {
  try {
    isSigningIn = true;

    // 1. Thử đăng nhập qua Firebase Auth Popup
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        return { user: result.user, accessToken: cachedAccessToken };
      }
    } catch (firebaseErr: any) {
      console.warn('Firebase Auth đăng nhập gặp vấn đề, chuyển sang cơ chế Google OAuth trực tiếp:', firebaseErr);
      // Nếu gặp lỗi unauthorized-domain hoặc lỗi domain Firebase Auth
      if (
        firebaseErr.code === 'auth/unauthorized-domain' ||
        firebaseErr.code === 'auth/operation-not-allowed' ||
        firebaseErr.message?.includes('unauthorized-domain')
      ) {
        const gisResult = await signInWithGoogleIdentity();
        return { user: gisResult.user, accessToken: gisResult.token };
      }
      // Các lỗi do người dùng chủ động đóng popup thì ném ra
      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        throw new Error('Bạn đã đóng cửa sổ đăng nhập Google');
      }
      throw firebaseErr;
    }

    // 2. Dự phòng: Sử dụng Google Identity Services
    const gisResult = await signInWithGoogleIdentity();
    return { user: gisResult.user, accessToken: gisResult.token };
  } catch (error: any) {
    console.error('Lỗi đăng nhập Google Drive:', error);
    // Nếu có lỗi, thử qua Google Identity Services lần cuối trước khi báo lỗi
    try {
      const fallbackResult = await signInWithGoogleIdentity();
      return { user: fallbackResult.user, accessToken: fallbackResult.token };
    } catch {
      throw error;
    }
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch {}
  cachedAccessToken = null;
};

// Compatibility aliases
export const signInWithGoogleDrive = async (): Promise<{ token: string; user: any }> => {
  const res = await googleSignIn();
  return { token: res.accessToken, user: res.user };
};
export const signOutGoogle = logout;
export const getStoredDriveToken = (): string | null => cachedAccessToken;
export const setStoredDriveToken = (token: string | null): void => {
  cachedAccessToken = token;
};
