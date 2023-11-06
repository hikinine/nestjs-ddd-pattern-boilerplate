/* eslint-disable @typescript-eslint/ban-types */
type Primitive =
  | 'string'
  | 'number'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function';
export class V {
  public static notInstanceOfOrNullable(value: unknown, type: Function) {
    if (value === undefined) return false;
    if (value === null) return false;

    return !(value instanceof type);
  }
  public static notInstanceOf(value: unknown, type: Function) {
    return !(value instanceof type);
  }

  public static isInstanceOf(value: unknown, type: Function) {
    return value instanceof type;
  }

  public static notArrayOfInstanceOf(value: unknown[], type: Function) {
    if (!Array.isArray(value)) return true;
    return !value.every((v) => v instanceof type);
  }

  public static notArrayOfPrimitive(value: unknown[], type: Primitive) {
    if (!Array.isArray(value)) return true;
    return !value.every((v) => typeof v === type);
  }
  public static notTypeOf(value: unknown, type: Primitive) {
    return typeof value !== type;
  }
  public static notTypeOfOrNullable(value: unknown, type: Primitive) {
    if (value === undefined) return false;
    if (value === null) return false;

    return typeof value !== type;
  }

  public static NotLength(value: string, min: number, max: number) {
    if (typeof value !== 'string') return true;

    return !(value.length >= min && value.length <= max);
  }

  public static numberRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max;
  };
}
