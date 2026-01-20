# 模组共创中心

用于展示模组最新信息，并提供玩家协作的物品分类工具（React + Vite + TypeScript）。

## 📚 文档导航

> 👈 **第一次来？从这里开始**

| 文档 | 内容 | 推荐度 |
|------|------|--------|
| [FINAL_GUIDE.md](./FINAL_GUIDE.md) | 完整指南、快速上手、常见问题 | ⭐⭐⭐⭐⭐ |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | 速查表、快捷键、常用命令 | ⭐⭐⭐⭐ |
| [ACHIEVEMENT_NODE_QUICK_START.md](./ACHIEVEMENT_NODE_QUICK_START.md) | 5分钟快速开始、工作流 | ⭐⭐⭐⭐⭐ |
| [ACHIEVEMENT_NODE_GUIDE.md](./ACHIEVEMENT_NODE_GUIDE.md) | 详细功能说明、数据结构 | ⭐⭐⭐⭐ |
| [UI_LAYOUT_GUIDE.md](./UI_LAYOUT_GUIDE.md) | 界面布局详解、样式说明 | ⭐⭐⭐ |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | 技术实现、设计决策 | ⭐⭐⭐ |
| [COMPLETION_REPORT.md](./COMPLETION_REPORT.md) | 项目完成报告、质量评估 | ⭐⭐ |

## ✨ 功能速览

- 🗂️ **模组列表** - 查看描述、标签、更新时间
- 📦 **物品详情** - 查看当前分类、贴图占位提示
- 🎯 **共创分类** - 玩家为物品选择/创建分类，生成协作记录
- 📝 **协作记录** - 集中展示最新提交，方便手动审核
- ⭐ **成就节点编辑** - 为模组创建树形成就系统，支持多父节点关系和实时连线显示（✨ 新功能）

## 🚀 运行要求

- Node.js 18+
- 推荐使用 pnpm（可用 npm/yarn）

## 📖 快速开始

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev
# 访问：http://localhost:5173/

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 🏗️ 项目结构

```
src/
├── App.tsx                              # 主应用
├── types.ts                             # 类型定义（包括成就节点）
└── components/
    ├── ModList.tsx                      # 模组列表
    ├── ModDetail.tsx                    # 物品分类界面
    ├── AchievementNodeEditor.tsx        # ⭐ 成就节点编辑器（新）
    ├── ConfigManager.tsx                # JSON 导入导出
    └── ...
public/
└── test/
    └── default-config.json              # 默认数据
```

## ⭐ 成就节点编辑器（新功能）

### 快速开始

1. **打开网站** → http://localhost:5173/
2. **选择模组** → 左侧列表点击
3. **切换模式** → 点击 **⭐ 编辑节点**
4. **创建节点** → 右侧 **➕ 创建根节点**
5. **编辑节点** → 点击节点，右侧菜单选择操作
6. **保存更改** → **✅ 保存更改**

### 核心功能

- **创建/删除节点** - 灵活创建和删除成就节点
- **物品关联** - 为节点选择关联的物品
- **节点描述** - 添加成就描述、条件等信息
- **建立关系** - 设置多个父节点，表示依赖关系
- **可视化连线** - 实时显示节点间的连接（贝塞尔曲线 + 箭头）
- **循环检测** - 自动防止循环依赖

### 数据结构

```typescript
// 节点数据
{
  id: string;
  name: string;
  itemId?: string;           // 关联物品 ID
  description?: string;      // 节点描述
  parentNodeIds: string[];   // 父节点 ID 列表
  position?: { x: number; y: number };
}

// 图结构（存储在 ModMeta.achievementGraph）
{
  modId: string;
  nodes: AchievementNode[];
}
```

### 关键特性

- ✅ **多父节点支持** - 一个节点可以有多个父节点
- ✅ **循环检测** - 自动阻止形成循环依赖
- ✅ **实时连线** - Canvas 绘制，高性能
- ✅ **完整导入导出** - JSON 格式，易于备份和分享
- ✅ **类型安全** - 100% TypeScript 覆盖

## 📊 与之前版本的对比

| 特性 | 分类模式 | 节点编辑器 |
|------|---------|----------|
| 物品分类 | ✅ | - |
| 节点创建 | - | ✅ |
| 节点关系 | - | ✅ |
| 多父节点 | - | ✅ |
| 可视化 | 网格 | 连线图 |
| 导入导出 | ✅ | ✅ |

## 🛠️ 开发指南

### TypeScript

所有源代码都使用 TypeScript，编译时进行严格类型检查。

```bash
npm run check    # 类型检查
```

### 构建

```bash
npm run build    # 生产构建
# 输出：dist 目录
```

### 代码风格

遵循 Prettier 格式化规范（可选）。

## 🔧 扩展建议

### 短期（可在几小时内实现）
- [ ] 节点拖动功能
- [ ] 搜索/过滤节点
- [ ] 节点复制功能

### 中期（可在1-2天内实现）
- [ ] 画布缩放平移
- [ ] 节点样式定制
- [ ] 导出为 PNG/SVG
- [ ] 批量操作

### 长期（需要3-5天及以上）
- [ ] WebSocket 实时协作
- [ ] 节点模板库
- [ ] 成就进度统计
- [ ] 高级可视化功能

## 📱 浏览器支持

| 浏览器 | 版本 | 状态 |
|--------|------|------|
| Chrome | 90+ | ✅ 支持 |
| Firefox | 88+ | ✅ 支持 |
| Safari | 14+ | ✅ 支持 |
| Edge | 90+ | ✅ 支持 |

## 🐛 故障排除

### 问题：节点不显示
- **解决**：确保点击了 "➕ 创建根节点"

### 问题：连线不显示
- **解决**：需要先设置节点之间的父子关系

### 问题：无法设置父节点
- **解决**：系统自动检测循环依赖，选择其他节点

### 问题：数据丢失
- **解决**：使用导出功能定期备份 JSON 文件

更多帮助见 [FINAL_GUIDE.md](./FINAL_GUIDE.md) FAQ 部分。

## 📞 支持和反馈

- 🐛 **Bug 报告** - GitHub Issues
- 💡 **功能建议** - GitHub Issues
- 🤝 **代码贡献** - GitHub Pull Requests

## 📄 许可证

待补充

## 🙏 致谢

感谢所有贡献者和用户的支持！

---

**版本**：1.0.0  
**最后更新**：2026-01-20  
**状态**：✅ 生产就绪
