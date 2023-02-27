import { isFunction, isNil, set } from 'lodash-es';
import React from 'react';

export const setRef = <T>(ref: React.Ref<T>, value: T) => {
  if (isNil(ref)) return;

  if (isFunction(ref)) {
    ref(value);
  } else {
    set(ref, 'current', value);
  }
};

export const absurd = (t: never) => {
  throw new Error(`${String(t)} should not reach here!`);
};

export const typeHolder = <T>(): T => undefined as unknown as T;

export type TypeHolder<T> = typeof typeHolder<T>;

export const fitIn = (target: number, [min, max]: [number, number]) =>
  Math.max(Math.min(target, max), min);
