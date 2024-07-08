"use client";

import { z } from "zod";
import { PathsOfType, useForm } from "./_form";
import { createUserSchema } from "./_form/schema";
import { createUser } from "./_form/action";

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
    <div>
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
      <InputField f={f} name="email" label="Email" />
      <InputField f={f} name="details.username" label="Username" />
      <InputField f={f} name="password" label="Password" />

      <f.Submit className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer" />
    </f.Form>
  );
}
