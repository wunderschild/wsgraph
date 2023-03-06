import { Plugin, PluginInitArgs } from 'base/plugin';
import { ObjectId, ObjectWithId } from 'base/types';
import { difference, isNil } from 'lodash-es';

import {
  PopoverArgs,
  PopoverIds,
  PopoversConfig,
  PopoversContext,
} from 'plugins/popover/types';
import React from 'react';
import { OverlayController, Position2D } from 'utils/overlay';
import OverlayCanvas from 'utils/overlay/OverlayCanvas';

type IPopoverPlugin<L extends PopoversConfig> = Plugin<
  'popover',
  ObjectWithId,
  ObjectWithId,
  PopoversContext<L>
>;

class PopoverPlugin<L extends PopoversConfig> implements IPopoverPlugin<L> {
  private controllerRef = React.createRef<OverlayController>();

  private openedPopovers: Partial<Record<PopoverIds<L['popovers']>, ObjectId>> =
    {};

  private context?: PopoversContext<L>;

  readonly id = 'popover';

  constructor(private config: L) {}

  private get controller() {
    return this.controllerRef.current;
  }

  private display<
    N extends PopoverIds<L['popovers']>,
    A extends PopoverArgs<L['popovers'], N>,
  >(id: N, args: A, position: Position2D): ObjectId | undefined {
    if (!isNil(this.controller)) {
      const popover = this.config.popovers.find(({ id: fId }) => fId === id);

      if (!isNil(popover)) {
        return this.controller.display(
          position,
          popover.render(args),
          this.config.popoverClassName,
        );
      }
    }
  }

  init({ context }: PluginInitArgs<IPopoverPlugin<L>>): Promise<void> | void {
    this.context = context;

    console.debug('popover init');
    console.debug('  context = %O', context);

    this.closeAll();
    for (const displayedPopover of context.displayedPopovers) {
      this.openedPopovers[displayedPopover.id] = this.display(
        displayedPopover.id,
        displayedPopover.args,
        displayedPopover.position,
      );
    }
  }

  onContextChanged(context: PopoversContext<L>) {
    const toClose = difference(
      this.context?.displayedPopovers,
      context.displayedPopovers,
    ).map(({ id }) => this.openedPopovers[id]);

    for (const inId of toClose) {
      if (!isNil(inId)) {
        this.close(inId);
      }
    }

    const toOpen = difference(
      context.displayedPopovers,
      this.context?.displayedPopovers ?? [],
    );

    for (const popover of toOpen) {
      const oldInId = this.openedPopovers[popover.id];
      if (!isNil(oldInId)) {
        this.close(oldInId);
      }

      this.openedPopovers[popover.id] = this.display(
        popover.id,
        popover.args,
        popover.position,
      );
    }

    this.context = context;
  }

  close(id: ObjectId) {
    const { current: controller } = this.controllerRef;

    if (!isNil(controller)) {
      controller.destroy(id);
    }
  }

  closeAll() {
    for (const popover of this.config.popovers) {
      const id = this.openedPopovers[popover.id as PopoverIds<L['popovers']>];

      if (!isNil(id)) {
        this.close(id);
      }
    }
  }

  render(): React.ReactNode {
    return React.createElement(OverlayCanvas, {
      pluginId: this.id,
      ref: this.controllerRef,
    });
  }
}

export default PopoverPlugin;
