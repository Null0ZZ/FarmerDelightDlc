# 模组共创中心

用于展示模组最新信息，并提供玩家协作的物品分类工具（React + Vite + TypeScript）。

## 功能速览
- 模组列表：查看描述、标签、更新时间。
- 物品详情：查看当前分类、贴图占位提示。
- 共创分类：玩家为物品选择/创建分类，生成协作记录。
- 协作记录：集中展示最新提交，方便手动审核。
- 成就节点编辑：为模组创建树形成就系统，支持多父节点关系和实时连线显示。

## 运行要求
- Node.js 18+（本机需先安装）。
- 推荐使用 pnpm（可用 npm/yarn 也行）。

## 快速开始
```bash
# 安装依赖（选择一种）
pnpm install
# or
npm install

# 开发调试
pnpm dev

# 生产构建
pnpm build

# 本地预览
pnpm preview
```

## 项目结构
- src/App.tsx：主界面与协作逻辑
- src/components：UI 组件
  - ModList.tsx：模组列表
  - ModDetail.tsx：物品分类界面
  - AchievementNodeEditor.tsx：成就节点编辑器
  - ConfigManager.tsx：JSON 导入导出
- src/types.ts：类型定义，包括 AchievementNode、AchievementGraph
- public/test/default-config.json：默认配置数据

## 成就节点编辑器

点击模组卡片的 **⭐ 编辑节点** 按钮，进入成就节点编辑页面。

### 主要功能
- **创建节点** - 点击 "➕ 创建根节点"，可创建新的成就节点
- **关联物品** - 为节点选择关联的物品，节点上会显示物品图标
- **设置描述** - 输入节点的成就描述（如条件、奖励等）
- **建立关系** - 设置节点间的父子关系，一个节点支持多个父节点
- **可视化连线** - 实时显示节点间的连接关系（贝塞尔曲线 + 箭头）
- **循环检测** - 自动防止形成循环依赖

### 数据结构
节点数据存储在 ModMeta 的 `achievementGraph` 字段中：

```typescript
{
  id: string;
  name: string;
  itemId?: string;           // 关联物品 ID
  description?: string;      // 节点描述
  parentNodeIds: string[];   // 父节点 ID 列表（支持多个）
  position?: { x: number; y: number };  // 节点位置
}
```

详见 [ACHIEVEMENT_NODE_GUIDE.md](./ACHIEVEMENT_NODE_GUIDE.md)

## 后续可扩展点
1. 接入真实后端 API，替换前端本地存储。
2. 增加节点拖动功能，自定义节点位置。
3. 节点支持图片、颜色、大小等样式定制。
4. 成就树的展示与交互优化（缩放、平移等）。
5. 支持多人实时协作编辑。
