import {
  FormHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFormState } from "react-dom";
import { ActionState, formDataToPayload } from "./actionHandler";
import { ZodIssue, ZodSchema } from "zod";

export type PathsOfType<T, V> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${T[K] extends V
        ? "" | `.${PathsOfType<T[K], V>}`
        : `.${PathsOfType<T[K], V>}`}`;
    }[keyof T]
  : never;

export function useForm<TPayload extends {}, TResult extends {}>(
  action: (
    state: ActionState<TPayload, TResult>,
    formData: FormData
  ) => Promise<ActionState<TPayload, TResult>>,
  validator: ZodSchema<TPayload>
) {
  const [state, dispatch] = useFormState(action, { status: "initial" });
  const [errors, setErrors] = useState<ZodIssue[]>(
    state.status === "error" ? state.errors : []
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      setErrors(state.errors);
    } else {
      setErrors([]);
    }
  }, [state]);

  const nameErrors = errors.map((error) => ({
    ...error,
    name: error.path.join("."),
  }));

  function Form(
    props: FormHTMLAttributes<HTMLFormElement> & { children: ReactNode }
  ) {
    return (
      <form {...props} action={dispatch} ref={formRef} key="xd">
        {props.children}
      </form>
    );
  }

  function Object<TFieldType>({
    name,
    render,
    defaultValue,
  }: {
    name: PathsOfType<TPayload, TFieldType>;
    render: (props: {
      value: TFieldType;
      setValue: (value: TFieldType) => void;
    }) => JSX.Element;
    defaultValue: TFieldType;
  }) {
    const [value, setValue] = useState<TFieldType>(defaultValue);

    return (
      <>
        <input name={name} type="hidden" value={JSON.stringify(value)} />
        {render({ value, setValue })}
      </>
    );
  }

  function Input<TFieldType>(
    props: {
      name: PathsOfType<TPayload, TFieldType>;
    } & InputHTMLAttributes<HTMLInputElement>
  ) {
    return <input {...props} name={props.name} />;
  }

  function Submit(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} type="submit" />;
  }

  function Error(
    props: {
      name: PathsOfType<TPayload, any>;
    } & HTMLAttributes<HTMLParagraphElement>
  ) {
    const messages = nameErrors.filter((error) =>
      error.name.startsWith(props.name)
    );
    return messages.map((error) => (
      <p key={error.name} {...props}>
        {error.message}
      </p>
    ));
  }

  return { Form, Object, Input, Submit, Error, state };
}
