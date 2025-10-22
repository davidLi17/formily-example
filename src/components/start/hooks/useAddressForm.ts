import { createForm } from "@formily/core";
import { useMemo } from "react";
import { DEFAULT_FORM_VALUES } from "../constants";
import { createAddressFormEffects } from "../effects";
import type { AddressFormModel } from "../types";

/**
 * 地址表单自定义 Hook
 * 封装表单创建和配置逻辑
 */
export function useAddressForm() {
    const form = useMemo(() => {
        return createForm<AddressFormModel>({
            initialValues: DEFAULT_FORM_VALUES,
            effects: createAddressFormEffects,
        });
    }, []);

    return { form };
}
