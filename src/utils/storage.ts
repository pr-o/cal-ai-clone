// TypeScript resolution stub — Metro uses storage.native.ts or storage.web.ts at runtime.
// This file is only referenced by tsc for type checking.
export const storage: {
  getString: (key: string) => string | undefined;
  getBoolean: (key: string) => boolean | undefined;
  set: (key: string, value: string | boolean | number) => void;
} = {
  getString: () => undefined,
  getBoolean: () => undefined,
  set: () => {},
};
