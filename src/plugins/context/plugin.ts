import { Plugin, PluginInitArgs3 } from 'base/plugin';
import { ObjectId, ObjectWithId } from 'base/types';
import { isEmpty, isNil } from 'lodash-es';
import ContextMenuContainer, {
  MenuRenderer,
  RenderedMenuItem,
} from 'plugins/context/component/ContextMenuContainer';
import {
  CertainContextEventTarget,
  ContextEventTarget,
  ContextEventTargetType,
  Pointer,
} from 'plugins/context/eventbus';
import { Menu, MenuConfig, MenuItem } from 'plugins/context/menuDSL';
import React, { PointerEvent } from 'react';
import { absurd } from 'utils';
import { hasValue, Maybe, nothing, some } from 'utils/option';
import { OverlayCanvas, OverlayController, Position2D } from 'utils/overlay';
import { Network } from 'vis-network';

interface VisPointerEvent {
  event: PointerEvent;
  pointer: {
    DOM: Position2D;
    canvas: Position2D;
  };
}

const mapPointer = (pointer: VisPointerEvent['pointer']): Pointer => ({
  dom: pointer.DOM,
  canvas: pointer.canvas,
});

class ContextMenuPlugin<
  EventType extends string,
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
  PluginContext,
> implements Plugin<'context', NodeType, EdgeType, PluginContext>
{
  private controller = React.createRef<OverlayController>();

  // PluginContext can be undefined (e.g. we don't need any context at all).
  // Having optional property and context set to undefined
  // makes context seem uninitialized even if it was.
  // Uninitialized context prevents context menu from being displayed.
  private context: Maybe<PluginContext> = nothing();

  private engine?: Network;

  private openedMenu?: ObjectId;

  readonly id = 'context';

  constructor(
    private menuConfig: MenuConfig<EventType, PluginContext>,
    private renderer: MenuRenderer,
  ) {}

  private getTarget(pointer: VisPointerEvent['pointer']): ContextEventTarget {
    const edgeId = this.engine?.getEdgeAt(pointer.DOM);
    const nodeId = this.engine?.getNodeAt(pointer.DOM);

    const mappedPtr = mapPointer(pointer);

    if (!isNil(edgeId)) {
      return {
        type: 'edge',
        pointer: mappedPtr,
        data: edgeId,
      };
    }

    if (!isNil(nodeId)) {
      return {
        type: 'node',
        pointer: mappedPtr,
        data: nodeId,
      };
    }

    return {
      type: 'canvas',
      pointer: mappedPtr,
    };
  }

  private injectEventData<T extends ContextEventTargetType>(
    item: MenuItem<string, T, PluginContext> & { type: 'action' },
    target: CertainContextEventTarget<T>,
  ): RenderedMenuItem {
    return {
      ...item,
      onTrigger: () => {
        const onTrigger = item.onTrigger;

        if (!isNil(onTrigger) && hasValue(this.context)) {
          onTrigger({ target }, this.context.value);
        }
      },
    };
  }

  private mapTargetedMenu<T extends ContextEventTargetType>(
    menuTemplate: Menu<string, T, PluginContext>,
    target: CertainContextEventTarget<T>,
  ) {
    return (menuTemplate || []).map(item =>
      item.type === 'divider' ? item : this.injectEventData(item, target),
    );
  }

  private mapMenu(target: ContextEventTarget): RenderedMenuItem[] {
    switch (target.type) {
      case 'canvas':
        return this.mapTargetedMenu(this.menuConfig.canvas || [], target);
      case 'node':
        return this.mapTargetedMenu(this.menuConfig.node || [], target);
      case 'edge':
        return this.mapTargetedMenu(this.menuConfig.edge || [], target);
      default:
        return absurd(target);
    }
  }

  private readonly onContext = ({ event, pointer }: VisPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isNil(this.openedMenu)) {
      this.controller.current?.destroy(this.openedMenu);
    }

    const menu = this.mapMenu(this.getTarget(pointer));

    if (!isEmpty(menu)) {
      this.openedMenu = this.controller.current?.display(
        pointer.DOM,
        React.createElement(ContextMenuContainer, {
          menu,
          renderer: this.renderer,
        }),
      );
    }
  };

  private readonly onClick = () => {
    if (!isNil(this.openedMenu)) {
      this.controller.current?.destroy(this.openedMenu);
    }
  };

  onContextChanged(context: PluginContext) {
    this.context = some(context);
  }

  init({
    engine,
    context,
  }: PluginInitArgs3<NodeType, EdgeType, PluginContext>): Promise<void> {
    this.engine = engine;
    this.context = some(context);

    console.debug('context init');
    console.debug('  engine = %O', engine);
    console.debug('  context = %O', context);

    engine.on('oncontext', this.onContext);

    engine.on('click', this.onClick);

    return Promise.resolve();
  }

  dispose() {
    if (!isNil(this.openedMenu)) {
      this.controller.current?.destroy(this.openedMenu);
    }

    this.engine?.off('oncontext');
    this.engine?.off('click');
  }

  render(): React.ReactNode {
    return React.createElement(OverlayCanvas, {
      pluginId: this.id,
      ref: this.controller,
    });
  }
}

export default ContextMenuPlugin;
