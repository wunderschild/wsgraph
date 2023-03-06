import { Popover, PopoversConfig } from './types';

const addPopover = <
  L extends readonly Popover<string, never>[],
  N extends string,
  T,
>(
  { popovers }: PopoversConfig<L>,
  popover: Popover<N, T>,
) => ({
  popovers: [...popovers, popover] as const,
});

class Configurer<L extends readonly Popover<string, never>[]> {
  constructor(private readonly config: PopoversConfig<L>) {}

  popover = <N extends string, T>(popover: Popover<N, T>) =>
    new Configurer(addPopover(this.config, popover));

  build = () => this.config;
}

export const popovers = (
  config: Omit<PopoversConfig<never>, 'popovers'>,
): Configurer<[]> =>
  new Configurer({
    ...config,
    popovers: [],
  });
