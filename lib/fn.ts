
export function noop() {/**/}
export function identity<T>(x: T): T {return x; }
export type AnyCallback = (error: Error, result?: any) => void;
