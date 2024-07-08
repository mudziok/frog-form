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

export function formDataToPayload(formData: FormData): any {
  const entries = formData.entries();
  const payload: any = {};

  for (const [key, rawValue] of entries) {
    const value = rawValue as string;
    const [root, ...nested] = key.split(".");

    const evaluateValue = (value: string) => {
      if (value.startsWith("{")) {
        return JSON.parse(value);
      } else {
        return value;
      }
    };

    const nestedValue = nested.reduce((acc, key) => {
      return { [key]: acc };
    }, evaluateValue(value) as any);

    payload[root] = nestedValue;
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
      const result = await action({ data: payload });
      return { status: "success", result };
    } else {
      return { status: "error", errors: validation.error.errors };
    }
  };
}
