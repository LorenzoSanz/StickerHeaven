
export class Result<T, E> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: E | undefined;
  private _value: T | undefined;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error("InvalidOperation: A result cannot be successful and contain an error");
    }
    if (!isSuccess && !error) {
      throw new Error("InvalidOperation: A failing result needs to contain an error message");
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public get value(): T {
    if (!this.isSuccess) {
      throw new Error("Cant get the value of an error result. Use 'error' instead.");
    }
    return this._value as T;
  }

  public static ok<U, F>(value?: U): Result<U, F> {
    return new Result<U, F>(true, undefined, value);
  }

  public static fail<U, F>(error: F): Result<U, F> {
    return new Result<U, F>(false, error);
  }

  /**
   * Comprueba una lista de Results y devuelve el primer fallo, o éxito si todos pasan.
   * Útil para validar múltiples entradas.
   * @param results - Array de Results a comprobar.
   */
  public static combine<U, F>(results: Result<U, F>[]): Result<void, F> {
    for (const result of results) {
      if (result.isFailure) return Result.fail<void, F>(result.error as F);
    }
    return Result.ok<void, F>();
  }
  
  /**
   * Alias del getter .value.
   */
  public getValue(): T {
    return this.value;
  }
}
