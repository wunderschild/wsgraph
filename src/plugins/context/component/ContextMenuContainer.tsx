import { ContextEventTargetType } from 'plugins/context/eventbus';
import { MenuItem } from 'plugins/context/menuDSL';
import React from 'react';
import classes from './ContextMenuContainer.module.scss';

type RenderedMenuItemAction = Omit<
  MenuItem<string, ContextEventTargetType, never> & { type: 'action' },
  'onTrigger'
> & {
  onTrigger: () => unknown;
};

type RenderedMenuItemDivider = MenuItem<
  string,
  ContextEventTargetType,
  never
> & {
  type: 'divider';
};

export type RenderedMenuItem = RenderedMenuItemDivider | RenderedMenuItemAction;

export interface MenuRendererProps {
  menu: RenderedMenuItem[];
}

export type MenuRenderer = React.ComponentType<MenuRendererProps>;

interface ContextMenuContainerProps {
  renderer: MenuRenderer;

  menu: RenderedMenuItem[];
}

const ContextMenuContainer: React.FC<ContextMenuContainerProps> = ({
  renderer: Renderer,
  menu,
}) => (
  <div className={classes.container}>
    <Renderer menu={menu} />
  </div>
);

export default ContextMenuContainer;
