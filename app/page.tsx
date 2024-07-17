"use client";

import { z } from "zod";
import { PathsOfType, useForm } from "./_form";
import { createUserSchema } from "./_form/schema";
import { createUser } from "./_form/action";
import { ReactNode } from "react";

type CreateUserPayload = z.infer<typeof createUserSchema>;

function InputField<TPayload extends {}, TResult extends {}>({
  f,
  name,
  label,
}: {
  f: ReturnType<typeof useForm<TPayload, TResult>>;
  name: PathsOfType<TPayload, string>;
  label: string;
}) {
  return (
    <div className="bg-slate-300 p-2 rounded-md">
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <f.Input
        name={name}
        id={name}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <f.Error
        name={name}
        className="mt-2 text-sm text-red-600 dark:text-red-500"
      />
    </div>
  );
}

function MetaField<TPayload extends {}, TResult extends {}>({
  f,
  name,
  label,
  children,
}: {
  f: ReturnType<typeof useForm<TPayload, TResult>>;
  name: PathsOfType<TPayload, any>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-slate-300 p-2 rounded-md">
      <legend className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </legend>
      {children}
      <f.Error
        name={name}
        className="mt-2 text-sm text-red-600 dark:text-red-500"
      />
    </div>
  );
}

function CombinedInputField<
  TPayload extends {},
  TResult extends {},
  TPath extends PathsOfType<TPayload, { username: string }>
>({
  f,
  name,
}: {
  f: ReturnType<typeof useForm<TPayload, TResult>>;
  name: TPath;
}) {
  return (
    <>
      <InputField
        f={f}
        //@ts-ignore
        name={`${name}.username`}
        label={"Username"}
      />
    </>
  );
}

function ControlledInput({
  value,
  setValue,
}: {
  value: CreateUserPayload["details"];
  setValue: (value: CreateUserPayload["details"]) => void;
}) {
  return (
    <div>
      <input
        type="text"
        value={value.username}
        onChange={(e) => setValue({ ...value, username: e.target.value })}
      />
    </div>
  );
}

export default function Home() {
  const f = useForm(createUser, createUserSchema);

  return (
    <f.Form className="bg-slate-200 p-4 m-4 flex flex-col gap-4 rounded-md">
      <MetaField f={f} name="email" label="Email">
        <f.Input
          name="email"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </MetaField>

      <MetaField f={f} name="details.username" label="Username">
        <f.Input<string>
          name="details.username"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </MetaField>

      <MetaField f={f} name="details.language" label="Language">
        <f.Select<z.infer<typeof createUserSchema>["details"]["language"]>
          name="details.language"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          {createUserSchema.shape.details.shape.language.options.map(
            (value) => (
              <option value={value} key={value}>
                {value}
              </option>
            )
          )}
        </f.Select>
      </MetaField>

      <MetaField f={f} name="details.gender" label="Gender">
        <div className="flex flex-col gap-2">
          {createUserSchema.shape.details.shape.gender.options.map((value) => (
            <div className="flex items-center" key={value}>
              <f.Input<z.infer<typeof createUserSchema>["details"]["gender"]>
                name="details.gender"
                type="radio"
                value={value}
                id={value}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor={value}
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                {value}
              </label>
            </div>
          ))}
        </div>
      </MetaField>

      <MetaField f={f} name="password" label="Password">
        <f.Input
          name="password"
          type="password"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </MetaField>

      <f.Submit className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer" />

      <pre className="bg-slate-300 p-4 rounded-md">
        {JSON.stringify(f.state, null, 2)}
      </pre>
    </f.Form>
  );
}
