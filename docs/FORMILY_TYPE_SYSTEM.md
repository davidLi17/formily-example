# Formily 类型系统深度解析

## 为什么需要 `as any` 或类型断言？

### 1. 问题根源

在 Formily 中，`onFieldReact` 回调函数接收的 `field` 参数类型是 `GeneralField`：

```typescript
type GeneralField = Field | VoidField | ArrayField | ObjectField;
```

这是一个**联合类型**，意味着 `field` 可能是以下四种类型之一：

-   **Field** - 普通数据字段（有 `value`、`dataSource` 等属性）
-   **VoidField** - 虚拟字段（没有 `value` 和 `dataSource`，仅用于布局）
-   **ArrayField** - 数组字段
-   **ObjectField** - 对象字段

### 2. VoidField 的特点

```typescript
// VoidField 的设计目的
VoidField: {
    用途: "主要用于管理可见性规则、组件渲染和装饰器规则";
    不支持: ["数据读写规则", "数据源规则", "验证规则"];
    没有属性: ["value", "dataSource", "validator"];
}
```

### 3. TypeScript 的类型推断

当你访问 `field.value` 或 `field.dataSource` 时，TypeScript 会检查 `GeneralField` 联合类型中的**所有**成员是否都有这个属性：

```typescript
interface VoidField {
    // ❌ 没有 value
    // ❌ 没有 dataSource
    display: "visible" | "hidden" | "none";
    pattern: "editable" | "disabled" | "readOnly";
}

interface Field {
    // ✅ 有 value
    value: any;
    // ✅ 有 dataSource
    dataSource: Array<{ label: string; value: any }>;
    display: "visible" | "hidden" | "none";
    pattern: "editable" | "disabled" | "readOnly";
}
```

因为 `VoidField` 没有 `value` 和 `dataSource`，所以 TypeScript 报错！

## 解决方案对比

### 方案 1：使用 `as any` （不推荐）

```typescript
onFieldReact("province", field => {
    const value = (field as any).value; // ❌ 失去类型检查
    (field as any).dataSource = data; // ❌ 拼写错误也不会报错
});
```

**缺点**：

-   ❌ 完全失去类型安全
-   ❌ 可能访问不存在的属性而不报错
-   ❌ IDE 无法提供智能提示

### 方案 2：使用类型断言 `as Field` （推荐）

```typescript
import type { Field } from "@formily/core";

onFieldReact("province", field => {
    // ✅ 明确告诉 TypeScript：我知道这是 Field 类型
    const value = (field as Field).value;
    (field as Field).dataSource = data;
});
```

**优点**：

-   ✅ 保留类型检查
-   ✅ IDE 智能提示
-   ✅ 类型安全

### 方案 3：使用类型守卫（最佳实践）

Formily 提供了类型守卫函数：

```typescript
import { isField, isDataField } from "@formily/core";

onFieldReact("province", field => {
    // ✅ 运行时类型检查 + 编译时类型收窄
    if (isField(field)) {
        field.value = "xxx"; // ✅ TypeScript 知道这里 field 是 Field 类型
        field.dataSource = data; // ✅ 有智能提示
    }
});
```

**Formily 提供的类型守卫**：

| 函数                    | 用途                                               | 返回类型                                       |
| ----------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `isField(target)`       | 检查是否为普通字段                                 | `target is Field`                              |
| `isVoidField(target)`   | 检查是否为虚拟字段                                 | `target is VoidField`                          |
| `isArrayField(target)`  | 检查是否为数组字段                                 | `target is ArrayField`                         |
| `isObjectField(target)` | 检查是否为对象字段                                 | `target is ObjectField`                        |
| `isDataField(target)`   | 检查是否为数据字段（Field/ArrayField/ObjectField） | `target is Field \| ArrayField \| ObjectField` |

### 方案 4：官方示例的做法

官方文档中的示例直接将类型断言放在 `field.query().take()` 的参数类型中：

```typescript
import { FormPathPattern, Field } from "@formily/core";

const useAsyncDataSource = (pattern: FormPathPattern, service: (field: Field) => Promise<any[]>) => {
    onFieldReact(pattern, field => {
        // 在外层不指定类型
        field.loading = true; // ✅ loading 是 GeneralField 都有的属性

        service(field as Field).then(
            action.bound(data => {
                (field as Field).dataSource = data(
                    // ✅ 类型断言
                    field as Field,
                ).loading = false;
            }),
        );
    });
};
```

## 完整示例对比

### ❌ 原始代码（有类型错误）

```typescript
onFieldReact("province", field => {
    field.value; // ❌ 类型错误：VoidField 没有 value
    field.dataSource; // ❌ 类型错误：VoidField 没有 dataSource
});
```

### ✅ 修复方案 1：类型断言

```typescript
import type { Field } from "@formily/core";

onFieldReact("province", field => {
    const value = (field as Field).value; // ✅ 类型安全
    (field as Field).dataSource = data; // ✅ 有智能提示
});
```

### ✅ 修复方案 2：类型守卫（最严格）

```typescript
import { isField } from "@formily/core";

onFieldReact("province", field => {
    if (isField(field)) {
        // ✅ 运行时检查
        field.value = "xxx"; // ✅ 类型收窄后安全访问
        field.dataSource = data; // ✅ 完全类型安全
    }
});
```

## 实际应用建议

### 场景 1：你确定字段类型

如果你 100% 确定某个字段是 `Field` 类型（如 Input、Select 等数据字段），使用类型断言即可：

```typescript
onFieldReact("province", field => {
    // 我们知道 province 是 Select，所以是 Field 类型
    (field as Field).dataSource = cities;
});
```

### 场景 2：字段类型不确定

如果字段可能是 VoidField（如布局组件），使用类型守卫：

```typescript
onFieldReact("someField", field => {
    if (isField(field)) {
        // 只有确实是 Field 时才操作
        field.value = "xxx";
    }
});
```

### 场景 3：批量操作

```typescript
// ✅ 推荐：使用类型守卫确保安全
field.query("*").forEach(field => {
    if (isField(field)) {
        field.reset(); // 只重置数据字段
    }
});
```

## 总结

| 方法        | 安全性  | 便利性    | 推荐度          |
| ----------- | ------- | --------- | --------------- |
| `as any`    | ❌ 最低 | ✅ 最简单 | ⭐ 不推荐       |
| `as Field`  | ⚠️ 中等 | ✅ 简单   | ⭐⭐⭐ 推荐     |
| `isField()` | ✅ 最高 | ⚠️ 稍繁琐 | ⭐⭐⭐⭐⭐ 最佳 |

**最佳实践**：

1. 如果你明确知道字段类型，使用 `as Field`
2. 如果需要严格的类型安全，使用 `isField()` 类型守卫
3. 永远不要使用 `as any`，除非你完全理解风险

## 参考资料

-   [Formily Core - GeneralField](https://core.formilyjs.org/api/models/field)
-   [Formily Core - Type Checkers](https://core.formilyjs.org/api/entry/form-checker)
-   [TypeScript - Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
