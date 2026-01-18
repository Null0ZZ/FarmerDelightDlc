# 模组共创中心

用于展示模组最新信息，并提供玩家协作的物品分类工具（React + Vite + TypeScript）。

## 功能速览
- 模组列表：查看描述、标签、更新时间。
- 物品详情：查看当前分类、贴图占位提示。
- 共创分类：玩家为物品选择/创建分类，生成协作记录。
- 协作记录：集中展示最新提交，方便手动审核。

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
- src/components：UI 组件（模组列表、详情、分类弹窗等）
- src/api/modService.ts：前端假数据与操作模拟
- src/data/mods.ts：示例模组与贡献数据
- src/types.ts：类型定义

## 后续可扩展点
1. 接入真实后端 API，替换 `modService` 的本地存储。
2. 增加上传贴图/物品数据的表单与文件存储。
3. 为协作记录增加审核流与权限分级。
4. 接入认证（如玩家账号）并展示贡献者头像/等级。
