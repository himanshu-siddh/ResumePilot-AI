export type ActionResult<TData = undefined, TField extends string = string> =
  | {
      ok: true;
      message: string;
      data: TData;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<TField, string[]>>;
    };

export function createInitialActionState<
  TData = undefined,
  TField extends string = string,
>(): ActionResult<TData, TField> {
  return {
    ok: false,
    message: "",
  };
}
