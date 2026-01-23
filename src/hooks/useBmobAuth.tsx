import { useState, useEffect, useCallback } from 'react';
import * as Bmob from '../lib/bmob';

export function useBmobAuth() {
  const [user, setUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  // 从云端验证管理员状态
  const verifyAdminStatus = useCallback(async (userId: string, token: string) => {
    setIsCheckingAdmin(true);
    try {
      const adminStatus = await Bmob.checkIsAdmin(userId, token);
      console.log('[Auth] Admin status from cloud:', adminStatus);
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (e) {
      console.error('[Auth] Failed to verify admin status:', e);
      setIsAdmin(false);
      return false;
    } finally {
      setIsCheckingAdmin(false);
    }
  }, []);

  useEffect(() => {
    const s = localStorage.getItem('bmob_session');
    const u = localStorage.getItem('bmob_user');
    if (s && u) {
      setSessionToken(s);
      const userData = JSON.parse(u);
      setUser(userData);
      // 不从本地读取 isAdmin，而是从云端验证
      // 先设为 false，然后异步验证
      setIsAdmin(false);
      if (userData.objectId) {
        verifyAdminStatus(userData.objectId, s);
      }
    }
  }, [verifyAdminStatus]);

  async function login(email: string, password: string) {
    const res = await Bmob.login(email, password);
    if (res && res.sessionToken) {
      localStorage.setItem('bmob_session', res.sessionToken);
      localStorage.setItem('bmob_user', JSON.stringify(res));
      setSessionToken(res.sessionToken);
      setUser(res);
      // 登录后从云端验证管理员状态
      setIsAdmin(false);
      if (res.objectId) {
        await verifyAdminStatus(res.objectId, res.sessionToken);
      }
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
    setIsAdmin(false);
  }

  return { user, sessionToken, isAdmin, isCheckingAdmin, login, register, logout, verifyAdminStatus };
}
