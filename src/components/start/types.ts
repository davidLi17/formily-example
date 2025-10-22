/**
 * 地址表单数据模型
 */
export interface AddressFormModel {
    province: string;
    city: string;
    input: string;
}

/**
 * 城市选项类型
 */
export interface CityOption {
    label: string;
    value: string;
}

/**
 * 城市字典类型
 */
export type CityDictionary = Record<string, CityOption[]>;
