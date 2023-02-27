import { ObjectId } from 'base/types';
import { uniqueId } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';

export interface Position2D {
  x: number;
  y: number;
}

export interface Overlay {
  id: string;
  position: Position2D;
  content: React.ReactNode;

  className?: string;
}

export interface OverlayController {
  display: (
    position: Position2D,
    content: React.ReactNode,
    className?: string,
  ) => ObjectId;
  destroy: (id: ObjectId) => void;
}

export const useOverlayController = (
  pluginId: string,
): readonly [Overlay[], OverlayController] => {
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  const display = useCallback(
    (position: Position2D, content: React.ReactNode, className?: string) => {
      const overlay = {
        id: uniqueId(`ovl-${pluginId}-`),
        content,
        position,
        className,
      };

      setOverlays(old => [...old, overlay]);

      return overlay.id;
    },
    [setOverlays, pluginId],
  );

  const destroy = useCallback(
    (idToDestroy: ObjectId) => {
      setOverlays(old => old.filter(({ id }) => idToDestroy !== id));
    },
    [setOverlays],
  );

  return useMemo(
    () => [overlays, { display, destroy }] as const,
    [overlays, destroy, display],
  );
};
