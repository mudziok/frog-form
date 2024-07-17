import {
  FormHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  createContext,
  useCallback,
  useContext,
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

const FormContext = createContext<{
  errors: ZodIssue[];
  validateErrors: () => void;
}>({
  errors: [],
  validateErrors: () => {},
});

export function useForm<TPayload extends {}, TResult extends {}>(
  action: (
    state: ActionState<TPayload, TResult>,
    formData: FormData
  ) => Promise<ActionState<TPayload, TResult>>,
  validator: ZodSchema<TPayload>
) {
  const [state, dispatch] = useFormState(action, { status: "initial" });

  const [form] = useState(() => {
    function Form(
      props: FormHTMLAttributes<HTMLFormElement> & { children: ReactNode }
    ) {
      const formRef = useRef<HTMLFormElement>(null);
      const [errors, setErrors] = useState<ZodIssue[]>(
        state.status === "error" ? state.errors : []
      );

      const validateErrors = useCallback(() => {
        const formData = new FormData(formRef.current!);
        const payload = formDataToPayload(formData);
        const validation = validator.safeParse(payload);
        if (validation.success) {
          setErrors([]);
        } else {
          setErrors(validation.error.errors);
        }
      }, [validator, setErrors]);

      return (
        <FormContext.Provider value={{ errors, validateErrors }}>
          <form {...props} action={dispatch} ref={formRef}>
            {props.children}
          </form>
        </FormContext.Provider>
      );
    }

    function Input<TFieldType>(
      props: {
        name: PathsOfType<TPayload, TFieldType>;
      } & Omit<InputHTMLAttributes<HTMLInputElement>, "name">
    ) {
      const { validateErrors } = useContext(FormContext);
      return (
        <input
          id={props.name}
          {...props}
          name={props.name}
          onChange={validateErrors}
        />
      );
    }

    function Checkbox(
      props: {
        name: PathsOfType<TPayload, Array<string>>;
      } & Omit<InputHTMLAttributes<HTMLInputElement>, "name">
    ) {
      const { validateErrors } = useContext(FormContext);
      return (
        <input
          id={props.name}
          type="checkbox"
          {...props}
          name={props.name}
          onChange={validateErrors}
        />
      );
    }

    function Select<TFieldType>(
      props: {
        name: PathsOfType<TPayload, TFieldType>;
      } & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name">
    ) {
      const { validateErrors } = useContext(FormContext);
      return (
        <select
          id={props.name}
          {...props}
          name={props.name}
          onChange={validateErrors}
        />
      );
    }

    function Textarea<TFieldType>(
      props: {
        name: PathsOfType<TPayload, TFieldType>;
      } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">
    ) {
      const { validateErrors } = useContext(FormContext);
      return (
        <textarea {...props} name={props.name} onChange={validateErrors} />
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
      const { validateErrors } = useContext(FormContext);

      return (
        <>
          <input
            name={name}
            type="hidden"
            value={JSON.stringify(value)}
            onChange={validateErrors}
          />
          {render({ value, setValue })}
        </>
      );
    }

    function Error(
      props: {
        name: PathsOfType<TPayload, any>;
      } & HTMLAttributes<HTMLParagraphElement>
    ) {
      const { errors } = useContext(FormContext);
      const nameErrors = errors.map((error) => ({
        ...error,
        name: error.path.join("."),
      }));
      const messages = nameErrors.filter((error) =>
        error.name.startsWith(props.name)
      );
      return messages.map((error) => (
        <p key={error.name} {...props}>
          {error.message}
        </p>
      ));
    }

    function Submit(props: InputHTMLAttributes<HTMLInputElement>) {
      return <input {...props} type="submit" />;
    }

    return { Form, Input, Checkbox, Select, Textarea, Object, Error, Submit };
  });

  return { ...form, state };
}
