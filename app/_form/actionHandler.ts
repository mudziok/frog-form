import { SafeParseReturnType, ZodSchema, z } from "zod";

export type ActionState<TPayload extends {}, TResult extends {}> =
  | {
      status: "initial";
    }
  | {
      status: "success";
      result: TResult;
    }
  | {
      status: "error";
      errors: Required<
        SafeParseReturnType<TPayload, TPayload>
      >["error"]["errors"];
    };

function isObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T extends Record<string, any>>(target: T, source: T): T {
  const output = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (isObject(sourceValue) && isObject(targetValue)) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  }

  return output;
}

const zodKeys = <T extends z.ZodTypeAny>(schema: T): string[] => {
  // make sure schema is not null or undefined
  if (schema === null || schema === undefined) return [];
  // check if schema is nullable or optional
  if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional)
    return zodKeys(schema.unwrap());
  // check if schema is an array
  if (schema instanceof z.ZodArray) return zodKeys(schema.element);
  // check if schema is an object
  if (schema instanceof z.ZodObject) {
    // get key/value pairs from schema
    const entries = Object.entries(schema.shape);
    // loop through key/value pairs
    return entries.flatMap(([key, value]) => {
      // get nested keys
      const nested =
        value instanceof z.ZodType
          ? zodKeys(value).map((subKey) => `${key}.${subKey}`)
          : [];
      // return nested keys
      return nested.length ? nested : key;
    });
  }
  // return empty array
  return [];
};

export function formDataToPayload(formData: FormData): any {
  const entries = [...formData.entries()];
  let payload: any = {};

  for (const [key, rawValue] of entries) {
    const value = rawValue as string;

    const evaluateValue = (value: string) => {
      if (value.startsWith("{")) {
        return JSON.parse(value);
      } else if (key.endsWith("[]")) {
        return entries.filter(([k]) => k === key).map(([, v]) => v);
      } else {
        return value;
      }
    };

    const nested = key.replace("[]", "").split(".");
    const nestedValue = nested.reduceRight((acc, key) => {
      return { [key]: acc };
    }, evaluateValue(value) as any);

    payload = deepMerge(payload, nestedValue);
  }
  return payload;
}

export function actionHandler<TPayload extends {}, TResult extends {}>({
  action,
  schema,
}: {
  action: ({}: { data: TPayload }) => Promise<TResult>;
  schema: ZodSchema<TPayload>;
}): (
  state: ActionState<TPayload, TResult>,
  formData: FormData
) => Promise<ActionState<TPayload, TResult>> {
  return async (state, formData) => {
    const payload = formDataToPayload(formData);
    const validation = schema.safeParse(payload);

    if (validation.success) {
      const result = await action({ data: validation.data });
      return { status: "success", result };
    } else {
      return { status: "error", errors: validation.error.errors };
    }
  };
}
