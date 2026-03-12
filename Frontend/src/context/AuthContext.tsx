// ★ 修正: 不要な 'React' のインポートを削除
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_BASE_URL } from "@/config/api";

// APIから返ってくるトークンの型
interface TokenResponse {
  access_token: string;
  token_type: string;
}

// APIから返ってくるユーザー情報の型
interface User {
  id: number;
  username: string;
  is_active: boolean;
}

// Contextで管理する値の型
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean; 
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// 1. Contextの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. AuthProviderコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user; 

  const API_URL = `${API_BASE_URL}/auth`;

  // 3. ログイン処理
  const login = async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await fetch(`${API_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      throw new Error('ユーザー名またはパスワードが間違っています。');
    }

    const data: TokenResponse = await response.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);

    await fetchUser(data.access_token);
  };

  // 5. ログアウト処理
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // 6. ユーザー情報取得
  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      const userData: User = await response.json();
      setUser(userData);
    } catch (error) {
      logout();
    }
  };

  // 7. 起動時のユーザー確認
  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        await fetchUser(token);
      }
      setIsLoading(false);
    };
    checkUser();
  }, [token]);

  // 認証確認中
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// 8. useAuthフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};