export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type ModItem = {
  id: string;
  name: string;
  texture?: string;
  currentCategoryId?: string;
  suggestedBy?: string;
};

export type ModMeta = {
  id: string;
  name: string;
  version: string;
  summary: string;
  tags: string[];
  lastUpdated: string;
  hero?: string;
  categories: Category[];
  items: ModItem[];
  achievementGraph?: AchievementGraph;
};

export type Contribution = {
  id: string;
  modId: string;
  itemId: string;
  newCategoryId: string;
  note?: string;
  contributor: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type AchievementNode = {
  id: string;
  name: string;
  itemId?: string;           // 关联的物品 ID
  description?: string;      // 节点描述
  parentNodeIds: string[];   // 父节点 ID 列表
  position?: {                // 节点在画布上的位置
    x: number;
    y: number;
  };
  glowColor?: string;        // 泛光颜色（十六进制或 rgba）
};

export type AchievementGraph = {
  modId: string;
  nodes: AchievementNode[];
};
