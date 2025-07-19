
import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Input, Button, Select, Card } from "antd";
import { useWatch } from "react-hook-form";
import "./SchemaBuilder.css";

const { Option } = Select;
const fieldTypes = ["String", "Number", "Nested"];

// Recursive Field Component
const SchemaField = ({
  nestName,
  control,
  register,
  setValue,
  watch,
  remove,
}) => {
  const {
    fields,
    append,
    remove: removeChild,
  } = useFieldArray({
    control,
    name: `${nestName}.children`,
  });

  const type = watch(`${nestName}.type`);
//   const fieldKey = watch(`${nestName}.key`);

  return (
    <Card size="small" className="field-card">
      <div className="field-row">
        <Controller
          control={control}
          name={`${nestName}.key`}
          render={({ field }) => (
            <Input
              placeholder="Field Name"
              {...field}
              className="field-input"
            />
          )}
        />
        <Controller
          control={control}
          name={`${nestName}.type`}
          render={({ field }) => (
            <Select {...field} placeholder="Select type" allowClear>
              <Option value="">-- Select Type --</Option>
              {fieldTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          )}
        />
        <Button danger onClick={remove}>
          Delete
        </Button>
      </div>

      {type === "Nested" && (
        <div className="nested-fields">
          {fields.map((child, idx) => (
            <SchemaField
              key={child.id}
              nestName={`${nestName}.children[${idx}]`}
              control={control}
              register={register}
              setValue={setValue}
              watch={watch}
              remove={() => removeChild(idx)}
            />
          ))}
          <Button
            type="dashed"
            onClick={() =>
              append({
                key: "",
                type: "",
                children: [],
              })
            }
            className="add-nested-button"
          >
            + Add Nested Field
          </Button>
        </div>
      )}
    </Card>
  );
};

// to generate final JSON schema
const generateJSON = (fields) => {
  const result = {};
  fields.forEach((field) => {
    if (!field.key) return;

    const fieldType = field.type;

    if (fieldType === "Nested") {
      result[field.key] = generateJSON(field.children || []);
    } else if (fieldType === "String") {
      result[field.key] = "string";
    } else if (fieldType === "Number") {
      result[field.key] = 0;
    } else {
      // Show empty value if type not selected yet
      result[field.key] = "";
    }
  });
  return result;
};





const SchemaBuilder = () => {
  const { control, handleSubmit, watch, setValue, register } = useForm({
    defaultValues: {
      fields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

 const currentFields = useWatch({
  control,
  name: "fields",
});
  const liveJSON = generateJSON(currentFields);

  const onSubmit = () => {
    console.log("Submitted Schema:", liveJSON);
  };

  return (
    <div className="schema-container">
      <h2> JSON Schema Builder</h2>
      <p className="description">
        Add items and see your live JSON schema update instantly.
      </p>

      <div className="schema-layout">
        <div className="form-section">
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field, index) => (
              <SchemaField
                key={field.id}
                nestName={`fields[${index}]`}
                control={control}
                register={register}
                setValue={setValue}
                watch={watch}
                remove={() => remove(index)}
              />
            ))}
            <div style={{ marginTop: "10px" }}>
              <Button
                type="primary"
                onClick={() =>
                  append({
                    key: "",
                    type: "",
                    children: [],
                  })
                }
              >
                + Add item
              </Button>
              <Button
                type="default"
                htmlType="submit"
                style={{ marginLeft: "10px" }}
              >
                Submit
              </Button>
            </div>
          </form>
        </div>

        <div className="json-preview">
          <h3>Live JSON Output</h3>
          <Card size="small" className="json-card">
            <pre>{JSON.stringify(liveJSON, null, 2)}</pre>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchemaBuilder;



