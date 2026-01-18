# 模组配置 JSON Schema

## 完整示例

```json
{
  "version": "1.0",
  "mods": [
    {
      "id": "my-mod-1",
      "name": "我的模组名称",
      "version": "1.0.0",
      "summary": "模组简短描述",
      "tags": ["标签1", "标签2"],
      "lastUpdated": "2026-01-18",
      "hero": "https://example.com/image.png",
      "categories": [
        {
          "id": "weapons",
          "name": "武器",
          "description": "所有武器类物品"
        },
        {
          "id": "materials",
          "name": "材料",
          "description": "制作材料"
        }
      ],
      "items": [
        {
          "id": "item_001",
          "name": "魔法剑",
          "texture": "https://example.com/icon.png",
          "currentCategoryId": "weapons"
        },
        {
          "id": "item_002",
          "name": "魔晶石",
          "texture": "https://example.com/icon2.png",
          "currentCategoryId": "materials"
        }
      ]
    }
  ]
}
```

## 字段说明

### 根对象
- `version` (string): 配置版本，推荐 "1.0"
- `mods` (array): 模组数组

### ModMeta (模组对象)
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | 是 | 模组唯一标识 (英文+连字符) |
| name | string | 是 | 模组名称 |
| version | string | 是 | 模组版本号 |
| summary | string | 是 | 模组简短描述 |
| tags | string[] | 是 | 标签数组 |
| lastUpdated | string | 否 | 最后更新日期 (YYYY-MM-DD) |
| hero | string | 否 | 模组头图 URL |
| categories | Category[] | 是 | 分类数组 |
| items | ModItem[] | 是 | 物品数组 |

### Category (分类对象)
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | 是 | 分类唯一标识 (英文+连字符) |
| name | string | 是 | 分类名称 |
| description | string | 否 | 分类描述 |

### ModItem (物品对象)
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | 是 | 物品唯一标识 |
| name | string | 是 | 物品名称 |
| texture | string | 否 | 物品贴图 URL |
| currentCategoryId | string | 是 | 当前所属分类 ID |

## 配置规范

1. **ID 规范**：只能包含英文字母、数字、连字符 (-)，不能有中文
2. **分类 ID 必须在 categories 中存在**
3. **物品的 currentCategoryId 必须指向有效的分类**
4. **贴图 URL** 可选，支持 HTTP/HTTPS 或本地路径

## 导入方式

见应用页面的"导入模组"功能：
1. 复制或上传 JSON 文件
2. 系统验证并导入
3. 覆盖现有数据或追加
