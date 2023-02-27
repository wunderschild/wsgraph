import {
  CertainContextEvent,
  ContextEventTargetType,
} from 'plugins/context/eventbus';
import React from 'react';

export type MenuItemType = 'divider' | 'action';

interface MenuItemBase<Type extends MenuItemType> {
  readonly type: Type;
}

type MenuItemDivider = MenuItemBase<'divider'>;

interface MenuItemActive<
  EventType extends string,
  Type extends Exclude<MenuItemType, 'divider'>,
> extends MenuItemBase<Type> {
  readonly id: EventType;

  readonly text: React.ReactNode;
}

interface MenuItemAction<
  EventType extends string,
  TargetType extends ContextEventTargetType,
  PluginContext,
> extends MenuItemActive<EventType, 'action'> {
  readonly onTrigger?: (
    event: CertainContextEvent<TargetType>,
    context: PluginContext,
  ) => unknown;
}

export type MenuItem<
  EventType extends string,
  TargetType extends ContextEventTargetType,
  PluginContext,
> = MenuItemDivider | MenuItemAction<EventType, TargetType, PluginContext>;

export type Menu<
  EventType extends string,
  TargetType extends ContextEventTargetType,
  PluginContext,
> = readonly MenuItem<EventType, TargetType, PluginContext>[];

export type MenuConfig<EventType extends string, PluginContext> = {
  [TargetType in ContextEventTargetType]?: Menu<
    EventType,
    TargetType,
    PluginContext
  >;
};

export const menu = <EventType extends string, PluginContext>(
  config: MenuConfig<EventType, PluginContext>,
): MenuConfig<EventType, PluginContext> => config;

export const action = <
  EventType extends string,
  TargetType extends ContextEventTargetType,
  PluginContext,
>(
  item: Omit<MenuItemAction<EventType, TargetType, PluginContext>, 'type'>,
): MenuItemAction<EventType, TargetType, PluginContext> => ({
  ...item,
  type: 'action',
});

export const divider = (): MenuItemDivider => ({
  type: 'divider',
});
