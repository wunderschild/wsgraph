import classNames from 'classnames';
import React from 'react';
import { setRef } from 'utils';
import { OverlayController, useOverlayController } from './controller';
import classes from './OverlayCanvas.module.scss';

interface OverlayCanvasProps {
  pluginId: string;
  className?: string;
}

const OverlayCanvas = React.forwardRef(
  (
    { className, pluginId }: OverlayCanvasProps,
    ref: React.Ref<OverlayController>,
  ) => {
    const [overlays, controller] = useOverlayController(pluginId);

    setRef(ref, controller);

    return (
      <div
        id={`overlay-canvas--${pluginId}`}
        className={classNames(className, classes.canvas)}
      >
        {overlays.map(
          ({ id, position: { x, y }, content, className: ovlClass }) => (
            <div
              id={id}
              key={id}
              className={classNames(classes.overlay, ovlClass)}
              style={{ left: x, top: y }}
            >
              {content}
            </div>
          ),
        )}
      </div>
    );
  },
);

export default OverlayCanvas;
