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
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormState } from "react-dom";
import { ActionState } from "./actionHandler";
import { ZodIssue, ZodSchema, z } from "zod";
import { zfd } from "zod-form-data";

export type PathsOfType<T, V> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${T[K] extends V
        ? "" | `.${PathsOfType<T[K], V>}`
        : `.${PathsOfType<T[K], V>}`}`;
    }[keyof T]
  : never;

const FormContext = createContext<{
  errors: ZodIssue[];
  touched: Record<string, true>;
  isAllTouched: boolean;
  validateErrors: (name: string) => void;
}>({
  errors: [],
  touched: {},
  isAllTouched: false,
  validateErrors: () => {},
});

export function useForm<
  TSchema extends ZodSchema,
  TResult extends {},
  TPayload extends z.infer<TSchema>
>(
  action: (
    state: ActionState<TPayload, TResult>,
    formData: FormData
  ) => Promise<ActionState<TPayload, TResult>>,
  validator: TSchema
) {
  const [state, setState] = useState<ActionState<TPayload, TResult>>({
    status: "initial",
  });

  const [form] = useState(() => {
    function Form(
      props: FormHTMLAttributes<HTMLFormElement> & { children: ReactNode }
    ) {
      const [state, dispatch] = useFormState(action, { status: "initial" });

      const formRef = useRef<HTMLFormElement>(null);
      const [errors, setErrors] = useState<ZodIssue[]>(
        state.status === "error" ? state.errors : []
      );

      const [touched, setTouched] = useState<Record<string, true>>({});
      const isAllTouched = state.status !== "initial";

      const validateErrors = useCallback(
        (name: string) => {
          setTouched((prev) => ({ ...prev, [name]: true }));

          const formData = new FormData(formRef.current!);
          const validation = zfd.formData(validator).safeParse(formData);
          if (validation.success) {
            setErrors([]);
          } else {
            setErrors(validation.error.errors);
          }
        },
        [validator, setErrors]
      );

      useEffect(() => {
        setState(state);
        if (state.status === "error") {
          setErrors(state.errors);
        }
      }, [setState, state]);

      return (
        <FormContext.Provider
          value={{ errors, isAllTouched, touched, validateErrors }}
        >
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
          onChange={() => validateErrors(props.name)}
          onBlur={() => validateErrors(props.name)}
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
          onChange={() => validateErrors(props.name)}
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
          onChange={() => validateErrors(props.name)}
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
        <textarea
          {...props}
          name={props.name}
          onChange={() => validateErrors(props.name)}
        />
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
            onChange={() => validateErrors(name)}
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
      const { errors, isAllTouched, touched } = useContext(FormContext);
      const nameErrors = errors.map((error) => ({
        ...error,
        name: error.path.join("."),
      }));
      const messages = nameErrors.filter((error) =>
        error.name.startsWith(props.name)
      );
      if (!touched[props.name] && !isAllTouched) return null;

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
