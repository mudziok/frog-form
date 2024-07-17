"use client";

import { z } from "zod";
import { PathsOfType, useForm } from "./_form";
import { createUserSchema } from "./_form/schema";
import { createUser } from "./_form/action";
import { ReactNode } from "react";

function InputField<TPayload extends {}, TResult extends {}>({
  f,
  name,
  label,
  className = "",
}: {
  f: ReturnType<typeof useForm<TPayload, TResult>>;
  name: PathsOfType<TPayload, string>;
  label: string;
  className?: string;
}) {
  return (
    <MetaField f={f} name={name} label={label} className={className}>
      <f.Input
        name={name}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 group-has-[p]:border-red-500"
      />
    </MetaField>
  );
}

function MetaField<TPayload extends {}, TResult extends {}>({
  f,
  name,
  label,
  children,
  className = "",
}: {
  f: ReturnType<typeof useForm<TPayload, TResult>>;
  name: PathsOfType<TPayload, any>;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-2 group ${className}`}>
      <legend className="block mb-2 text-sm font-medium text-gray-900 dark:text-white group-has-[p]:text-red-600">
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

function UserDetailFields<TPayload extends {}, TResult extends {}>({
  f,
  name,
}: {
  f: ReturnType<typeof useForm<TPayload, TResult>>;
  name: {
    username: PathsOfType<TPayload, string>;
    language: PathsOfType<
      TPayload,
      z.infer<typeof createUserSchema>["details"]["language"]
    >;
    gender: PathsOfType<
      TPayload,
      z.infer<typeof createUserSchema>["details"]["gender"]
    >;
  };
}) {
  return (
    <div className="border rounded-md">
      <div className="flex">
        <InputField
          f={f}
          name={name.username}
          label="Username"
          className="flex-1"
        />
        <MetaField
          f={f}
          name={name.language}
          label="Language"
          className="flex-1"
        >
          <f.Select<z.infer<typeof createUserSchema>["details"]["language"]>
            name={name.language}
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
      </div>
      <div className="flex">
        <MetaField f={f} name={name.gender} label="Gender" className="flex-1">
          <div className="flex flex-col gap-2">
            {createUserSchema.shape.details.shape.gender.options.map(
              (value) => (
                <div className="flex items-center" key={value}>
                  <f.Input<
                    z.infer<typeof createUserSchema>["details"]["gender"]
                  >
                    name={name.gender}
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
              )
            )}
          </div>
        </MetaField>
      </div>
    </div>
  );
}

export default function Home() {
  const f = useForm(createUser, createUserSchema);

  return (
    <f.Form className="p-4 flex flex-col gap-4 rounded-md">
      <div className="border rounded-md flex">
        <InputField f={f} label="Email" name="email" className="flex-1" />
        <InputField f={f} label="Password" name="password" className="flex-1" />
      </div>

      <UserDetailFields
        f={f}
        name={{
          gender: "details.gender",
          language: "details.language",
          username: "details.username",
        }}
      />

      <MetaField
        f={f}
        name={"details.interests"}
        label="Interests"
        className="flex-1 border rounded-md"
      >
        <div className="flex flex-col gap-2">
          {createUserSchema.shape.details.shape.interests.element.options.map(
            (value) => (
              <div className="flex items-center" key={value}>
                <f.Checkbox
                  name={"details.interests[]"}
                  value={value}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor={value}
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  {value}
                </label>
              </div>
            )
          )}
        </div>
      </MetaField>

      <f.Submit className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer" />

      <pre className="border p-4 rounded-md">
        {JSON.stringify(f.state, null, 2)}
      </pre>
    </f.Form>
  );
}
