// 简单的 Bmob REST API 客户端（前端用）
// 配置：在项目根目录创建 .env 文件，添加 VITE_BMOB_APP_ID 和 VITE_BMOB_REST_KEY
// 重要：不要把 Master Key 放到前端！只有 AppID / REST Key（按 Bmob 文档）

const APP_ID = import.meta.env.VITE_BMOB_APP_ID as string;
const REST_KEY = import.meta.env.VITE_BMOB_REST_KEY as string;
const BASE = 'https://api.codenow.cn/1';

console.log('[Bmob Init] AppID:', APP_ID ? '✓' : '✗', 'REST_KEY:', REST_KEY ? '✓' : '✗', 'BASE:', BASE);

function headers(sessionToken?: string) {
  const h: Record<string, string> = {
    'X-Bmob-Application-Id': APP_ID || '',
    'X-Bmob-REST-API-Key': REST_KEY || '',
    'Content-Type': 'application/json'
  };
  if (sessionToken) h['X-Bmob-Session-Token'] = sessionToken;
  return h;
}

export async function register(email: string, password: string) {
  try {
    console.log('Registering with:', { email, appId: APP_ID });
    const res = await fetch(`${BASE}/classes/_User`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ username: email, password })
    });
    const data = await res.json();
    console.log('Register response:', data);
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  } catch (e) {
    console.error('Register error:', e);
    throw e;
  }
}

export async function login(email: string, password: string) {
  try {
    console.log('Logging in with:', { email });
    const res = await fetch(`${BASE}/login?username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
      headers: headers()
    });
    const data = await res.json();
    console.log('Login response:', data);
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  } catch (e) {
    console.error('Login error:', e);
    throw e;
  }
}

export async function saveNodes(ownerId: string, nodesJson: any, sessionToken?: string) {
  const res = await fetch(`${BASE}/classes/Nodes`, {
    method: 'POST',
    headers: headers(sessionToken),
    body: JSON.stringify({ ownerId, data: JSON.stringify(nodesJson) })
  });
  return res.json();
}

export async function updateNodes(objectId: string, nodesJson: any, sessionToken?: string) {
  const res = await fetch(`${BASE}/classes/Nodes/${objectId}`, {
    method: 'PUT',
    headers: headers(sessionToken),
    body: JSON.stringify({ data: JSON.stringify(nodesJson) })
  });
  return res.json();
}

export async function loadNodesForUser(ownerId: string, sessionToken?: string) {
  const where = encodeURIComponent(JSON.stringify({ ownerId }));
  const res = await fetch(`${BASE}/classes/Nodes?where=${where}`, {
    headers: headers(sessionToken)
  });
  const j = await res.json();
  return j.results || [];
}

export async function uploadFile(file: File, _sessionToken?: string) {
  const form = new FormData();
  form.append('file', file);
  // Bmob 文件上传 可能需要不同的 endpoint/version，此处尝试常见路径
  const res = await fetch(`${BASE}/files/${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: {
      'X-Bmob-Application-Id': APP_ID || '',
      'X-Bmob-REST-API-Key': REST_KEY || ''
      // 不设置 Content-Type 让浏览器自动设置 multipart boundary
    },
    body: form
  });
  return res.json();
}

// 模组数据同步函数
export async function saveMods(ownerId: string, modsJson: any, sessionToken?: string) {
  const res = await fetch(`${BASE}/classes/Mods`, {
    method: 'POST',
    headers: headers(sessionToken),
    body: JSON.stringify({ ownerId, data: JSON.stringify(modsJson) })
  });
  return res.json();
}

export async function updateMods(objectId: string, modsJson: any, sessionToken?: string) {
  const res = await fetch(`${BASE}/classes/Mods/${objectId}`, {
    method: 'PUT',
    headers: headers(sessionToken),
    body: JSON.stringify({ data: JSON.stringify(modsJson) })
  });
  return res.json();
}

export async function loadModsForUser(ownerId: string, sessionToken?: string) {
  const where = encodeURIComponent(JSON.stringify({ ownerId }));
  const res = await fetch(`${BASE}/classes/Mods?where=${where}`, {
    headers: headers(sessionToken)
  });
  const j = await res.json();
  return j.results || [];
}

// 协作记录同步函数
export async function saveContributions(ownerId: string, contributionsJson: any, sessionToken?: string) {
  const res = await fetch(`${BASE}/classes/Contributions`, {
    method: 'POST',
    headers: headers(sessionToken),
    body: JSON.stringify({ ownerId, data: JSON.stringify(contributionsJson) })
  });
  return res.json();
}

export async function updateContributions(objectId: string, contributionsJson: any, sessionToken?: string) {
  const res = await fetch(`${BASE}/classes/Contributions/${objectId}`, {
    method: 'PUT',
    headers: headers(sessionToken),
    body: JSON.stringify({ data: JSON.stringify(contributionsJson) })
  });
  return res.json();
}

export async function loadContributionsForUser(ownerId: string, sessionToken?: string) {
  const where = encodeURIComponent(JSON.stringify({ ownerId }));
  const res = await fetch(`${BASE}/classes/Contributions?where=${where}`, {
    headers: headers(sessionToken)
  });
  const j = await res.json();
  return j.results || [];
}

export function isConfigured() {
  return Boolean(APP_ID && REST_KEY);
}

// 验证用户是否为管理员（从云端 AdminUsers 表查询）
export async function checkIsAdmin(userId: string, sessionToken?: string): Promise<boolean> {
  try {
    // 查询 AdminUsers 表，检查是否存在该用户ID
    const where = encodeURIComponent(JSON.stringify({ userId, isActive: true }));
    const res = await fetch(`${BASE}/classes/AdminUsers?where=${where}`, {
      headers: headers(sessionToken)
    });
    const data = await res.json();
    console.log('[Bmob] checkIsAdmin response:', data);
    // 如果找到记录且 isActive 为 true，则是管理员
    return Array.isArray(data.results) && data.results.length > 0;
  } catch (e) {
    console.error('[Bmob] checkIsAdmin error:', e);
    return false;
  }
}
