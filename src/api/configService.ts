import { ModMeta } from '../types';

export interface ModConfig {
  version: string;
  mods: ModMeta[];
}

export const validateModConfig = (config: unknown): { valid: boolean; error?: string } => {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: '配置必须是对象' };
  }

  const cfg = config as Record<string, unknown>;

  if (!cfg.version || typeof cfg.version !== 'string') {
    return { valid: false, error: '缺少 version 字段' };
  }

  if (!Array.isArray(cfg.mods)) {
    return { valid: false, error: '缺少 mods 数组' };
  }

  for (let i = 0; i < cfg.mods.length; i++) {
    const mod = cfg.mods[i];
    if (!mod || typeof mod !== 'object') {
      return { valid: false, error: `模组 ${i}: 必须是对象` };
    }

    const modObj = mod as Record<string, unknown>;

    // 检查必需字段
    if (!modObj.id || typeof modObj.id !== 'string') {
      return { valid: false, error: `模组 ${i}: 缺少或 id 字段类型错误` };
    }

    if (!modObj.name || typeof modObj.name !== 'string') {
      return { valid: false, error: `模组 ${modObj.id}: 缺少或 name 字段类型错误` };
    }

    if (!modObj.version || typeof modObj.version !== 'string') {
      return { valid: false, error: `模组 ${modObj.id}: 缺少或 version 字段类型错误` };
    }

    if (!Array.isArray(modObj.categories)) {
      return { valid: false, error: `模组 ${modObj.id}: 缺少或 categories 数组` };
    }

    if (!Array.isArray(modObj.items)) {
      return { valid: false, error: `模组 ${modObj.id}: 缺少或 items 数组` };
    }

    // 验证分类 ID
    const categoryIds = new Set((modObj.categories as any[]).map((c) => c.id));

    // 验证物品指向的分类存在
    for (const item of modObj.items as any[]) {
      if (!categoryIds.has(item.currentCategoryId)) {
        return {
          valid: false,
          error: `模组 ${modObj.id}: 物品 ${item.id} 引用了不存在的分类 ${item.currentCategoryId}`
        };
      }
    }
  }

  return { valid: true };
};

export const importModConfig = (jsonString: string): { success: boolean; data?: ModConfig; error?: string } => {
  try {
    const config = JSON.parse(jsonString);
    const validation = validateModConfig(config);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    return { success: true, data: config as ModConfig };
  } catch (err) {
    return { success: false, error: `JSON 解析失败: ${(err as Error).message}` };
  }
};

export const exportModConfig = (mods: ModMeta[]): string => {
  const config: ModConfig = {
    version: '1.0',
    mods
  };
  return JSON.stringify(config, null, 2);
};
