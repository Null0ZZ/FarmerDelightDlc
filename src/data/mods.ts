import { Contribution, ModMeta, ModItem } from '../types';

// 生成随机物品数据
const generateRandomItems = (count: number, categoryIds: string[]): ModItem[] => {
  const adjectives = ['魔法', '古老', '闪耀', '秘密', '神圣', '黑暗', '光辉', '远古', '稀有', '精致', '坚固', '幻想', '晶体', '钢铁', '纯净'];
  const nouns = ['剑', '盾', '戒指', '项链', '手镯', '魔杖', '药水', '宝石', '水晶', '珠子', '符文', '纹章', '灵魂', '心脏', '骨头', '羽毛', '尘埃', '火焰', '冰雪', '风'];
  const items: ModItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
    
    items.push({
      id: `item_${i + 1}`,
      name: `${adj}${noun}${i % 3 === 0 ? i : ''}`,
      texture: undefined,
      currentCategoryId: categoryId
    });
  }
  
  return items;
};

export const mods: ModMeta[] = [
  {
    id: 'arcane-wilds',
    name: 'Arcane Wilds',
    version: '1.4.2',
    summary: '魔法与自然结合的冒险模组，包含 500+ 新物品、结构与 Boss。',
    tags: ['魔法', '探索', '冒险'],
    lastUpdated: '2026-01-05',
    hero: 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1000&q=80',
    categories: [
      { id: 'weapons', name: '武器', description: '近战与远程武器' },
      { id: 'artifacts', name: '遗物', description: '稀有被动与能力' },
      { id: 'materials', name: '材料', description: '制作与附魔资源' }
    ],
    items: generateRandomItems(500, ['weapons', 'artifacts', 'materials'])
  },
  {
    id: 'industrial-reborn',
    name: 'Industrial Reborn',
    version: '0.9.8-beta',
    summary: '科技与自动化扩展，新增能源网络、加工流水线与模块化机器。',
    tags: ['科技', '自动化', '能源'],
    lastUpdated: '2025-12-12',
    hero: 'https://images.unsplash.com/photo-1508387024700-9fe5c0b39cc7?auto=format&fit=crop&w=1000&q=80',
    categories: [
      { id: 'machines', name: '机器', description: '加工、发电与支持型设备' },
      { id: 'components', name: '部件', description: '电路、壳体、芯片等' },
      { id: 'fluids', name: '流体', description: '液体、气体与储罐' }
    ],
    items: generateRandomItems(500, ['machines', 'components', 'fluids'])
  },
  {
    id: 'culinary-frontier',
    name: 'Culinary Frontier',
    version: '0.6.1',
    summary: '烹饪拓展，新增 500+ 食材、工具与食谱，支持多段烹饪步骤。',
    tags: ['生活', '食物', '趣味'],
    lastUpdated: '2026-01-10',
    hero: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80',
    categories: [
      { id: 'ingredients', name: '食材', description: '原料与半成品' },
      { id: 'utensils', name: '器具', description: '锅、烤炉、搅拌器' },
      { id: 'dishes', name: '成品', description: '可食用菜肴' }
    ],
    items: generateRandomItems(500, ['ingredients', 'utensils', 'dishes'])
  }
];

export const seedContributions: Contribution[] = [
  {
    id: 'c1',
    modId: 'arcane-wilds',
    itemId: 'crystal_bloom',
    newCategoryId: 'materials',
    note: '用于高阶附魔台制作，归为材料。',
    contributor: '玩家A',
    createdAt: '2026-01-12T09:00:00Z',
    status: 'pending'
  },
  {
    id: 'c2',
    modId: 'industrial-reborn',
    itemId: 'quantum_presser',
    newCategoryId: 'machines',
    note: '自动化加工核心设备。',
    contributor: '玩家B',
    createdAt: '2026-01-14T11:30:00Z',
    status: 'approved'
  }
];
