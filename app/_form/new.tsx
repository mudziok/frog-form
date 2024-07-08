type Paths<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}`;
    }[keyof T]
  : never;

type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never
        ? ""
        : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

type KeysOfType<T, V> = { [P in keyof T as T[P] extends V ? P : never]: V } & {
  [P in keyof T as T[P] extends object ? P : never]: KeysOfType<T[P], V>;
};

type Payload = {
  email: string;
  details: {
    username: string;
    age: number;
  };
};

type LeavesOfType<T, V> = Leaves<KeysOfType<T, V>>;
type X = Leaves<KeysOfType<Payload, string>>;

const xd: LeavesOfType<Payload, number> = "details.age";
