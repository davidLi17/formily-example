# Start 组件重构说明

## 📁 文件结构

```
src/components/start/
├── index.tsx              # 主组件（61 行）
├── types.ts              # TypeScript 类型定义
├── constants.ts          # 常量配置（城市数据、默认值等）
├── schema.ts             # Formily Schema 定义
├── effects.ts            # 表单副作用逻辑（联动效果）
└── hooks/
    └── useAddressForm.ts # 自定义 Hook（封装表单创建）
```

## 🎯 拆分原则

### 1. **关注点分离（Separation of Concerns）**

每个文件只负责一个职责：

-   `types.ts` - 类型定义
-   `constants.ts` - 数据常量
-   `schema.ts` - UI 结构
-   `effects.ts` - 业务逻辑
-   `hooks/` - 状态管理
-   `index.tsx` - UI 渲染

### 2. **可复用性（Reusability）**

-   `effects.ts` 可以在其他表单中复用
-   `schema.ts` 可以作为其他页面的参考
-   `constants.ts` 可以被多个组件共享

### 3. **可维护性（Maintainability）**

-   修改城市数据？只需编辑 `constants.ts`
-   调整表单样式？只需修改 `schema.ts`
-   更改联动逻辑？只需修改 `effects.ts`

### 4. **可测试性（Testability）**

-   每个模块都可以独立测试
-   `effects.ts` 可以单独进行单元测试
-   `schema.ts` 可以验证配置完整性

## 📊 重构对比

### 重构前（171 行）

```tsx
index.tsx (171 行)
├── imports
├── 类型定义
├── 城市数据字典
├── Form 创建 + Effects
├── SchemaField 配置
├── 样式定义
├── Schema 定义
└── 组件渲染
```

### 重构后（61 行）

```tsx
index.tsx (61 行)        # ⬇️ 减少 110 行
├── imports
├── SchemaField 配置
├── 样式定义
└── 组件渲染（使用 Hook）

types.ts (18 行)
constants.ts (38 行)
schema.ts (48 行)
effects.ts (48 行)
hooks/useAddressForm.ts (18 行)
```

**主文件减少 64%，代码更清晰！**

## 🔧 各文件详解

### `types.ts` - 类型定义

```typescript
export interface AddressFormModel {
    province: string;
    city: string;
    input: string;
}

export interface CityOption {
    label: string;
    value: string;
}

export type CityDictionary = Record<string, CityOption[]>;
```

**职责：** 定义整个模块使用的 TypeScript 类型

### `constants.ts` - 常量配置

```typescript
export const CITY_DICT: CityDictionary = {
    zhejiang: [...],
    jiangsu: [...],
    fujian: [...],
};

export const PROVINCE_OPTIONS = [...];
export const DEFAULT_FORM_VALUES = {...};
```

**职责：** 存储不会变化的配置数据

### `schema.ts` - Schema 定义

```typescript
export const addressFormSchema: ISchema = {
    type: "object",
    properties: {
        province: {...},
        city: {...},
        input: {...},
    },
};
```

**职责：** 定义表单的 UI 结构和字段配置

### `effects.ts` - 副作用逻辑

```typescript
export function createAddressFormEffects() {
    // 省份变化时，更新城市选项
    onFieldReact("province", async (field) => {...});

    // 城市变化时，更新输入框
    onFieldReact("city", (field) => {...});
}
```

**职责：** 实现表单字段间的联动逻辑

### `hooks/useAddressForm.ts` - 自定义 Hook

```typescript
export function useAddressForm() {
    const form = useMemo(() => {
        return createForm<AddressFormModel>({
            initialValues: DEFAULT_FORM_VALUES,
            effects: createAddressFormEffects,
        });
    }, []);

    return { form };
}
```

**职责：** 封装表单创建和配置逻辑

### `index.tsx` - 主组件

```tsx
const StartFormily: FC = () => {
    const { form } = useAddressForm();

    return (
        <FormProvider form={form}>
            <SchemaField schema={addressFormSchema} />
            {/* ...其他 UI */}
        </FormProvider>
    );
};
```

**职责：** 组装各个模块，负责 UI 渲染

## 🚀 优势总结

| 方面         | 重构前                      | 重构后                                |
| ------------ | --------------------------- | ------------------------------------- |
| **可读性**   | ⭐⭐ 171 行代码在一个文件   | ⭐⭐⭐⭐⭐ 职责清晰，易于理解         |
| **可维护性** | ⭐⭐ 修改需要在大文件中定位 | ⭐⭐⭐⭐⭐ 修改特定功能只需找对应文件 |
| **可复用性** | ⭐ 代码耦合，难以复用       | ⭐⭐⭐⭐⭐ 模块化，可独立复用         |
| **可测试性** | ⭐⭐ 难以单独测试某个功能   | ⭐⭐⭐⭐⭐ 每个模块可独立测试         |
| **团队协作** | ⭐⭐ 容易产生冲突           | ⭐⭐⭐⭐⭐ 不同人可以修改不同文件     |

## 📝 使用示例

### 修改城市数据

```typescript
// 只需编辑 constants.ts
export const CITY_DICT: CityDictionary = {
    zhejiang: [
        { label: "杭州", value: "hangzhou" },
        { label: "新增城市", value: "new_city" }, // ✅ 在这里添加
    ],
};
```

### 添加新字段

```typescript
// 1. 更新类型 (types.ts)
export interface AddressFormModel {
    province: string;
    city: string;
    input: string;
    newField: string; // ✅ 添加新字段类型
}

// 2. 更新 Schema (schema.ts)
export const addressFormSchema: ISchema = {
    properties: {
        // ...existing fields
        newField: {
            // ✅ 添加新字段配置
            type: "string",
            title: "新字段",
            "x-decorator": "FormItem",
            "x-component": "Input",
        },
    },
};

// 3. index.tsx 不需要修改！✅
```

### 调整联动逻辑

```typescript
// 只需编辑 effects.ts
export function createAddressFormEffects() {
    onFieldReact("province", async field => {
        // ✅ 在这里修改省份变化的逻辑
    });
}
```

## 🎓 最佳实践

1. **保持单一职责** - 每个文件只做一件事
2. **使用明确的命名** - 文件名清楚表达其内容
3. **抽离可复用逻辑** - 通用逻辑放在独立文件
4. **类型优先** - 先定义类型，再写实现
5. **注释清晰** - 每个导出都有说明注释

## 🔗 相关文档

-   [Formily 类型系统深度解析](../../docs/FORMILY_TYPE_SYSTEM.md)
-   [Schema TypeScript 约束指南](../../docs/SCHEMA_TYPESCRIPT.md)

## 🆚 迁移指南

如果你有类似的大组件需要重构，可以参考以下步骤：

1. **分析现有代码** - 识别可以拆分的部分
2. **创建类型文件** - 抽离所有类型定义
3. **提取常量** - 将硬编码的数据移到 constants 文件
4. **拆分业务逻辑** - 将副作用、工具函数等独立出来
5. **简化主组件** - 只保留渲染逻辑
6. **验证功能** - 确保重构后功能正常

---

**重构完成时间：** 2025-10-22  
**重构类型：** 代码组织优化（功能无变化）  
**测试状态：** ✅ 所有文件无类型错误
