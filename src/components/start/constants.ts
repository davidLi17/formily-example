import type { CityDictionary } from "./types";

/**
 * 省份-城市映射字典
 */
export const CITY_DICT: CityDictionary = {
    zhejiang: [
        { label: "杭州", value: "hangzhou" },
        { label: "宁波", value: "ningbo" },
        { label: "温州", value: "wenzhou" },
    ],
    jiangsu: [
        { label: "南京", value: "nanjing" },
        { label: "苏州", value: "suzhou" },
        { label: "常州", value: "changzhou" },
    ],
    fujian: [
        { label: "福州", value: "fuzhou" },
        { label: "厦门", value: "xiamen" },
        { label: "莆田", value: "putian" },
    ],
};

/**
 * 省份选项
 */
export const PROVINCE_OPTIONS = [
    { label: "浙江", value: "zhejiang" },
    { label: "江苏", value: "jiangsu" },
    { label: "福建", value: "fujian" },
];

/**
 * 默认表单值
 */
export const DEFAULT_FORM_VALUES = {
    province: "zhejiang",
    city: "hangzhou",
    input: "Hello world",
};
