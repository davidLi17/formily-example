import { FormButtonGroup, FormItem, FormLayout, Input, Select, Submit } from "@formily/antd-v5";
import { FormConsumer, FormProvider, createSchemaField } from "@formily/react";
import { createStyles, css } from "antd-style";
import { FC } from "react";
import useStylish from "../commonStylish";
import { useAddressForm } from "./hooks/useAddressForm";
import { addressFormSchema } from "./schema";

/**
 * SchemaField 配置
 * 注册所有需要的表单组件
 */
const SchemaField = createSchemaField({
    components: {
        FormItem,
        Input,
        FormLayout,
        Select,
    },
});

/**
 * 样式定义
 */
const useStyles = createStyles(css`
    border: 1px dashed #07ef6f;
    margin-bottom: 20px;
    padding: 5px;
`);

/**
 * 地址表单组件
 * 演示省市联动选择器
 */
const StartFormily: FC = () => {
    const { styles } = useStyles();
    const stylish = useStylish();
    const { form } = useAddressForm();

    const handleClick = () => {
        const values = form.getFormState(state => state.values);
        console.log("🔍表单值:::", values);
    };

    return (
        <div className={stylish.wraper}>
            <h2>复杂表单示例 - 联动选择器</h2>
            <p>选择省份后，城市选项会自动更新，输入框会自动显示"省份-城市"</p>

            <FormProvider form={form}>
                <SchemaField schema={addressFormSchema} />

                <FormConsumer>
                    {formValues => (
                        <div className={styles}>
                            <strong>当前表单值：</strong>
                            <pre>{JSON.stringify(formValues.values, null, 2)}</pre>
                        </div>
                    )}
                </FormConsumer>

                <FormButtonGroup>
                    <Submit
                        onSubmit={values => {
                            console.log("🔍提交的值:::", values);
                            handleClick();
                        }}>
                        提交
                    </Submit>
                </FormButtonGroup>
            </FormProvider>
        </div>
    );
};

export default StartFormily;
