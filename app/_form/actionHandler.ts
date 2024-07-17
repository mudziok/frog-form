import { SafeParseReturnType, ZodSchema } from "zod";

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
  return typeof value === "object" && value !== null;
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

export function formDataToPayload(formData: FormData): any {
  const entries = formData.entries();
  let payload: any = {};

  for (const [key, rawValue] of entries) {
    const value = rawValue as string;
    const nested = key.split(".");

    const evaluateValue = (value: string) => {
      if (value.startsWith("{")) {
        return JSON.parse(value);
      } else {
        return value;
      }
    };

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
    console.log(formData);
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
