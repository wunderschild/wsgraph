import React from 'react';
import { Position2D } from 'utils/overlay';

/* eslint @typescript-eslint/no-explicit-any: 0 */

export interface Popover<N extends string, T> {
  id: N;
  render: (args: T) => React.ReactNode;
}

export interface PopoversConfig<T = readonly Popover<string, any>[]> {
  readonly popovers: T;
  readonly popoverClassName?: string;
}

export type PopoverIds<L extends readonly Popover<string, any>[]> =
  L[number]['id'];

export type PopoverArgs<
  L extends readonly Popover<string, any>[],
  N extends PopoverIds<L>,
> = L[number] extends Popover<N, infer T> ? T : never;

export type CertainPopover<
  L extends readonly Popover<string, any>[],
  N extends PopoverIds<L>,
> = Popover<N, PopoverArgs<L, N>>;

export interface DisplayedPopover<
  L extends readonly Popover<string, any>[],
  N extends PopoverIds<L>,
> {
  id: N;
  position: Position2D;

  args: PopoverArgs<L, N>;
}

export interface PopoversContext<L extends PopoversConfig> {
  displayedPopovers: DisplayedPopover<
    L['popovers'],
    PopoverIds<L['popovers']>
  >[];
}
