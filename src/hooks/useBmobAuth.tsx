import { useState, useEffect } from 'react';
import * as Bmob from '../lib/bmob';

export function useBmobAuth() {
  const [user, setUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem('bmob_session');
    const u = localStorage.getItem('bmob_user');
    if (s && u) {
      setSessionToken(s);
      setUser(JSON.parse(u));
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await Bmob.login(email, password);
    if (res && res.sessionToken) {
      localStorage.setItem('bmob_session', res.sessionToken);
      localStorage.setItem('bmob_user', JSON.stringify(res));
      setSessionToken(res.sessionToken);
      setUser(res);
    }
    return res;
  }

  async function register(email: string, password: string) {
    const res = await Bmob.register(email, password);
    return res;
  }

  function logout() {
    localStorage.removeItem('bmob_session');
    localStorage.removeItem('bmob_user');
    setSessionToken(null);
    setUser(null);
  }

  return { user, sessionToken, login, register, logout };
}
