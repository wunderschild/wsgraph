import { get } from 'lodash-es';

export interface Some<T> {
  value: T;
}

export type Nothing = {
  __: 0;
};

export type Maybe<T> = Some<T> | Nothing;

export const some = <T>(value: T): Maybe<T> => ({ value });
export const nothing = <T>(): Maybe<T> => ({ __: 0 });

export const hasValue = <T>(maybe: Maybe<T>): maybe is Some<T> =>
  get(maybe, '__') !== 0;
