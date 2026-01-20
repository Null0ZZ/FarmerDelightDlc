import React, { useState } from 'react';
import { useBmobAuth } from '../hooks/useBmobAuth';

export const BmobAuth: React.FC<{ onLoggedIn?: () => void }> = ({ onLoggedIn }) => {
  const { user, login, register, logout } = useBmobAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res && res.sessionToken) {
          onLoggedIn?.();
        } else {
          setError('登录失败');
        }
      } else {
        const res = await register(email, password);
        if (res && res.objectId) {
          setMode('login');
        } else {
          setError('注册失败');
        }
      }
    } catch (e: any) {
      setError(e.message || '出错');
    }
    setLoading(false);
  }

  if (user) {
    return (
      <div style={{ padding: 8 }}>
        <div>已登录: {user.username || user.email || user.objectId}</div>
        <button onClick={() => { logout(); }} style={{ marginTop: 8 }}>登出</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
      <input placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={submit} disabled={loading}>{mode === 'login' ? '登录' : '注册'}</button>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? '去注册' : '去登录'}</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default BmobAuth;
