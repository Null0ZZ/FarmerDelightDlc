# 本地图片上传指南

## 文件夹结构

```
public/
├── textures/          # 物品贴图存放文件夹
│   ├── weapons/       # 可选子文件夹
│   ├── materials/
│   └── [你的图片文件]
└── [其他资源]
```

## 操作步骤

### 1. 将图片放入 public/textures

将你的 PNG/JPG 图片文件复制到：
```
c:\Users\29510\Desktop\网站项目\public\textures\
```

### 2. 在 JSON 中引用图片

使用相对于 `public` 文件夹的路径：

**单个文件：**
```json
{
  "id": "item_001",
  "name": "魔法剑",
  "texture": "/textures/sword.png",
  "currentCategoryId": "weapons"
}
```

**组织到子文件夹：**
```
public/textures/weapons/sword.png
```
```json
{
  "texture": "/textures/weapons/sword.png"
}
```

## 支持的图片格式

- PNG（推荐）：`/textures/item.png`
- JPG：`/textures/item.jpg`
- WebP：`/textures/item.webp`

## 图片建议

- **尺寸**：64×64 或 128×128 像素（正方形）
- **透明度**：PNG 支持透明背景
- **文件名**：使用英文+数字，避免特殊字符

## 示例

完整配置示例：
```json
{
  "version": "1.0",
  "mods": [
    {
      "id": "my-mod",
      "name": "我的模组",
      "version": "1.0.0",
      "summary": "描述",
      "tags": ["标签"],
      "categories": [
        {
          "id": "weapons",
          "name": "武器"
        }
      ],
      "items": [
        {
          "id": "sword_001",
          "name": "魔法剑",
          "texture": "/textures/weapons/sword_001.png",
          "currentCategoryId": "weapons"
        }
      ]
    }
  ]
}
```

## 注意事项

- 图片路径前必须有 `/`
- 文件名区分大小写（Linux 服务器）
- 开发时可使用本地路径，部署时使用相对路径确保兼容性
