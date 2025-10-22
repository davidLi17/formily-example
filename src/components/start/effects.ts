import { isField, onFieldReact } from "@formily/core";
import { action } from "@formily/reactive";
import { CITY_DICT } from "./constants";

/**
 * 创建地址表单的副作用
 * 包含省市联动和自动更新逻辑
 */
export function createAddressFormEffects() {
    // 省份变化时，更新城市选项
    onFieldReact("province", async field => {
        if (isField(field)) {
            const provinceValue = field.value;
            console.log("🔍provinceValue:::", provinceValue);

            const cities = CITY_DICT[provinceValue] || [];
            console.log("🔍cities:::", cities);

            action(() => {
                field.query("city").take(city => {
                    if (isField(city)) {
                        city.dataSource = cities;
                        // 重置城市值为第一个选项
                        city.value = cities[0]?.value || "";
                        console.log("🔍city:::", city);
                    }
                });
            });
        }
    });

    // 城市变化时，更新输入框
    onFieldReact("city", field => {
        const province = field.query("province").get("value");
        const cityValue = field.query("city").get("value");

        action(() => {
            field.query("input").take(input => {
                if (isField(input)) {
                    input.value = `${province}-${cityValue}`;
                }
            });
        });
    });
}
