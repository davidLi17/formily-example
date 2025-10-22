# Formily Schema TypeScript 类型约束完全指南

## 目录

1. [基础类型约束](#基础类型约束)
2. [高级类型约束](#高级类型约束)
3. [类型检查和验证](#类型检查和验证)
4. [最佳实践](#最佳实践)
5. [常见问题](#常见问题)

---

## 基础类型约束

### 方案 1：使用 `ISchema` 类型注解（推荐）

```typescript
import type { ISchema } from "@formily/react";

// ✅ 最简单直接的方式
const schema: ISchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            title: "姓名",
            "x-decorator": "FormItem",
            "x-component": "Input",
        },
    },
};
```

**优点：**

-   ✅ 自动类型检查
-   ✅ IDE 智能提示
-   ✅ 简单直观
-   ✅ 编译时错误提示

**缺点：**

-   ⚠️ 不够精确（允许任何字符串作为 key）
-   ⚠️ 没有针对特定字段的类型检查

### 方案 2：使用字面量类型（类型更严格）

```typescript
import type { ISchema } from "@formily/react";

interface ProvinceField extends ISchema {
    type: "string";
    title: "省份";
    "x-component": "Select";
}

interface CityField extends ISchema {
    type: "string";
    title: "城市";
    "x-component": "Select";
}

// 更精确的类型定义
const schema: ISchema = {
    type: "object",
    properties: {
        province: {
            type: "string",
            title: "省份",
            "x-decorator": "FormItem",
            "x-component": "Select",
        } as ProvinceField,
        city: {
            type: "string",
            title: "城市",
            "x-decorator": "FormItem",
            "x-component": "Select",
        } as CityField,
    },
};
```

---

## 高级类型约束

### 方案 3：创建强类型 Schema Builder（最佳实践）

```typescript
import type { ISchema } from "@formily/react";

/**
 * 定义支持的组件类型
 */
type ComponentType = "Input" | "Select" | "DatePicker" | "Checkbox" | "Radio";
type DecoratorType = "FormItem" | "FormLayout" | "ArrayItems";

/**
 * 基础字段约束
 */
interface BaseFieldSchema extends ISchema {
    type: "string" | "number" | "boolean" | "date" | "datetime" | "object" | "array";
    title?: string;
    description?: string;
    required?: boolean;
    "x-decorator"?: DecoratorType;
    "x-component"?: ComponentType;
    "x-component-props"?: Record<string, any>;
}

/**
 * 输入字段约束
 */
interface InputFieldSchema extends BaseFieldSchema {
    type: "string";
    "x-component": "Input";
    "x-component-props"?: {
        placeholder?: string;
        maxLength?: number;
        readonly?: boolean;
    };
}

/**
 * 选择字段约束
 */
interface SelectFieldSchema extends BaseFieldSchema {
    type: "string";
    "x-component": "Select";
    "x-component-props"?: {
        placeholder?: string;
        mode?: "multiple" | "tags";
    };
    enum?: Array<{
        label: string;
        value: any;
    }>;
}

/**
 * Schema 工厂函数 - 提供类型安全的字段创建
 */
const SchemaFactory = {
    // 创建输入字段
    input: (config: Omit<InputFieldSchema, "type" | "x-decorator" | "x-component">): InputFieldSchema => ({
        type: "string",
        "x-decorator": "FormItem",
        "x-component": "Input",
        ...config,
    }),

    // 创建选择字段
    select: (config: Omit<SelectFieldSchema, "type" | "x-decorator" | "x-component">): SelectFieldSchema => ({
        type: "string",
        "x-decorator": "FormItem",
        "x-component": "Select",
        ...config,
    }),

    // 创建对象（包含多个字段）
    object: (properties: Record<string, ISchema>): ISchema => ({
        type: "object",
        properties,
    }),
};

/**
 * 使用 Schema Factory 创建类型安全的 schema
 */
const schema = SchemaFactory.object({
    province: SchemaFactory.select({
        title: "省份",
        enum: [
            { label: "浙江", value: "zhejiang" },
            { label: "江苏", value: "jiangsu" },
        ],
    }),
    city: SchemaFactory.input({
        title: "城市",
        "x-component-props": {
            placeholder: "请输入城市",
        },
    }),
});
```

### 方案 4：使用泛型创建表单类型（高级）

```typescript
import type { ISchema } from "@formily/react";

/**
 * 根据表单数据模型创建强类型 schema
 */
interface FormSchema<T> {
    [K in keyof T]: ISchema & {
        type: T[K] extends string ? "string"
            : T[K] extends number ? "number"
            : T[K] extends boolean ? "boolean"
            : "object";
        title: string;
    };
}

interface AddressFormModel {
    province: string;
    city: string;
    zipCode: number;
}

/**
 * 这样创建的 schema 会被约束为只能包含 AddressFormModel 中的字段
 */
const schema: Record<keyof AddressFormModel, ISchema> = {
    province: {
        type: "string",
        title: "省份",
        "x-decorator": "FormItem",
        "x-component": "Select",
    },
    city: {
        type: "string",
        title: "城市",
        "x-decorator": "FormItem",
        "x-component": "Select",
    },
    zipCode: {
        type: "number",
        title: "邮编",
        "x-decorator": "FormItem",
        "x-component": "Input",
    },
};
```

---

## 类型检查和验证

### 编译时类型验证

```typescript
import type { ISchema } from "@formily/react";

// ❌ 错误：x-component 只能是特定的值
const badSchema: ISchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            "x-component": "InvalidComponent", // ❌ TypeScript 错误（如果使用了类型约束）
        },
    },
};

// ✅ 正确：x-component 必须是已注册的组件
const goodSchema: ISchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            "x-component": "Input", // ✅ 正确
        },
    },
};
```

### 运行时验证

```typescript
import type { ISchema } from "@formily/react";

/**
 * 运行时 schema 验证函数
 */
function validateSchema(schema: any): schema is ISchema {
    if (!schema || typeof schema !== "object") {
        return false;
    }

    // 检查必要属性
    if (!schema.type) {
        console.error("Schema missing 'type' property");
        return false;
    }

    // 检查类型有效性
    const validTypes = ["string", "number", "boolean", "object", "array", "void", "date", "datetime"];
    if (!validTypes.includes(schema.type)) {
        console.error(`Invalid type: ${schema.type}`);
        return false;
    }

    return true;
}

// 使用验证函数
const schema = getSchemaFromAPI();
if (validateSchema(schema)) {
    // schema 现在被认为是有效的 ISchema
    renderForm(schema);
} else {
    console.error("Invalid schema received");
}
```

---

## 最佳实践

### 实践 1：分离 Schema 定义

```typescript
// schema.ts
import type { ISchema } from "@formily/react";

// 定义可复用的字段模板
export const fieldTemplates = {
    selectField: (title: string, options: Array<{ label: string; value: any }>): ISchema => ({
        type: "string",
        title,
        "x-decorator": "FormItem",
        "x-component": "Select",
        enum: options,
    }),

    inputField: (title: string, placeholder: string): ISchema => ({
        type: "string",
        title,
        "x-decorator": "FormItem",
        "x-component": "Input",
        "x-component-props": {
            placeholder,
        },
    }),
};

// 导出完整的 schema
export const addressFormSchema: ISchema = {
    type: "object",
    properties: {
        province: fieldTemplates.selectField("省份", [
            { label: "浙江", value: "zhejiang" },
            { label: "江苏", value: "jiangsu" },
        ]),
        city: fieldTemplates.inputField("城市", "请输入城市"),
    },
};
```

```typescript
// component.tsx
import { addressFormSchema } from "./schema";

const AddressForm = () => {
    return (
        <FormProvider form={form}>
            <SchemaField schema={addressFormSchema} />
        </FormProvider>
    );
};
```

### 实践 2：与表单数据模型同步

```typescript
import type { ISchema } from "@formily/react";

// 定义表单数据模型
interface AddressFormModel {
    province: string;
    city: string;
    input: string;
}

// Schema 字段必须与模型字段对应
const schema: ISchema = {
    type: "object",
    properties: {
        // 这些 key 必须对应 AddressFormModel 的属性
        province: {
            /* ... */
        },
        city: {
            /* ... */
        },
        input: {
            /* ... */
        },
        // ❌ 下面这个会导致运行时问题（虽然 TS 可能不会报错）
        // invalidField: { /* ... */ }, // ⚠️ 不在模型中
    },
};

// 更严格的做法
const schemaStrict: Record<keyof AddressFormModel, ISchema> = {
    province: {
        /* ... */
    },
    city: {
        /* ... */
    },
    input: {
        /* ... */
    },
    // ❌ TypeScript 会报错：缺少必要的属性或有多余的属性
};
```

### 实践 3：类型导出和共享

```typescript
// types.ts
import type { ISchema } from "@formily/react";

export interface FormSchema extends ISchema {
    type: "object";
    properties: Record<string, ISchema>;
}

export type ComponentType = "Input" | "Select" | "DatePicker" | "Checkbox" | "Radio" | "Textarea";

export interface FieldOptions {
    title: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
}

// schema-builder.ts
import type { FormSchema, ComponentType, FieldOptions } from "./types";

export class SchemaBuilder {
    private schema: FormSchema = {
        type: "object",
        properties: {},
    };

    addField(name: string, component: ComponentType, options: FieldOptions): this {
        this.schema.properties[name] = {
            type: "string",
            title: options.title,
            description: options.description,
            "x-decorator": "FormItem",
            "x-component": component,
            "x-component-props": {
                placeholder: options.placeholder,
            },
            required: options.required,
        };
        return this;
    }

    build(): FormSchema {
        return this.schema;
    }
}

// 使用
const schema = new SchemaBuilder()
    .addField("name", "Input", { title: "姓名", placeholder: "请输入姓名" })
    .addField("city", "Select", { title: "城市", required: true })
    .build();
```

---

## 常见问题

### Q1：如何处理动态 schema？

```typescript
import type { ISchema } from "@formily/react";

/**
 * 根据条件动态生成 schema
 */
function generateSchema(userRole: "admin" | "user"): ISchema {
    const baseSchema: ISchema = {
        type: "object",
        properties: {
            name: {
                type: "string",
                title: "姓名",
                "x-decorator": "FormItem",
                "x-component": "Input",
            },
        },
    };

    // 仅管理员可以编辑权限
    if (userRole === "admin") {
        (baseSchema.properties as any).role = {
            type: "string",
            title: "角色",
            "x-decorator": "FormItem",
            "x-component": "Select",
        };
    }

    return baseSchema;
}
```

### Q2：如何验证自定义属性？

```typescript
import type { ISchema } from "@formily/react";

/**
 * 扩展 ISchema 支持自定义属性
 */
interface CustomSchema extends ISchema {
    "x-custom-attr"?: string;
    "x-permissions"?: string[];
}

const schema: CustomSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            "x-custom-attr": "custom-value",
            "x-permissions": ["read", "write"],
        },
    },
};
```

### Q3：如何与 API 返回的 schema 协作？

```typescript
import type { ISchema } from "@formily/react";

/**
 * 验证并转换 API 返回的 schema
 */
async function fetchAndValidateSchema(url: string): Promise<ISchema> {
    try {
        const response = await fetch(url);
        const data = await response.json();

        // 类型断言（谨慎使用）
        const schema = data as ISchema;

        // 验证关键属性
        if (!schema.type || !schema.properties) {
            throw new Error("Invalid schema structure");
        }

        return schema;
    } catch (error) {
        console.error("Failed to fetch schema:", error);
        throw error;
    }
}

// 使用
const schema = await fetchAndValidateSchema("/api/form-schema");
```

---

## 总结

| 方案           | 复杂度        | 类型安全性    | 推荐场景   |
| -------------- | ------------- | ------------- | ---------- |
| ISchema        | ⭐ 最简       | ⭐ 基础       | 简单表单   |
| 字面量类型     | ⭐⭐ 中       | ⭐⭐ 良       | 中等复杂度 |
| Schema Factory | ⭐⭐⭐ 高     | ⭐⭐⭐ 高     | 复杂表单   |
| 泛型约束       | ⭐⭐⭐⭐ 最高 | ⭐⭐⭐⭐ 最高 | 企业级应用 |

**推荐：** 对大多数项目，使用 **方案 1**（简单类型注解） + **方案 3**（Schema Factory）的结合是最平衡的方案。
