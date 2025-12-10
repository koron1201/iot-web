import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // 1. 【変更】AuthContextをインポート
import { useNavigate, Navigate } from 'react-router-dom'; // 2. 【追加】Navigate をインポート

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth(); // 3. 【変更】login関数とuser情報を取得

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 4. 【変更】AuthContextのlogin関数を実行
      await login(username, password);
      // 成功したらカレンダーページに遷移
      navigate('/calendar');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('ログイン処理中に不明なエラーが発生しました。');
      }
    }
  };

  // 5. 【追加】もし既にログイン済みなら、カレンダーページに自動でリダイレクト
  if (user) {
    return <Navigate to="/calendar" replace />;
  }

  return (
    <div className="p-8 max-w-md mx-auto mt-10 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">ユーザー名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          ログイン
        </button>
      </form>
    </div>
  );
};

export default Login;