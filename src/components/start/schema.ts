import type { ISchema } from "@formily/react";
import { PROVINCE_OPTIONS } from "./constants";

/**
 * 地址表单的 Schema 定义
 */
export const addressFormSchema: ISchema = {
    type: "object",
    properties: {
        province: {
            type: "string",
            title: "省份",
            default: "zhejiang",
            "x-decorator": "FormItem",
            "x-component": "Select",
            "x-component-props": {
                placeholder: "请选择省份",
                style: { width: 150 },
                allowClear: true,
            },
            enum: PROVINCE_OPTIONS,
        },
        city: {
            type: "string",
            title: "城市",
            "x-decorator": "FormItem",
            "x-component": "Select",
            "x-component-props": {
                placeholder: "请选择城市",
                style: { width: 150 },
                allowClear: true,
            },
        },
        input: {
            type: "string",
            title: "自动更新输入框",
            "x-decorator": "FormItem",
            "x-component": "Input",
            "x-component-props": {
                placeholder: "省份-城市",
                readOnly: true,
                allowClear: true,
            },
        },
    },
};
