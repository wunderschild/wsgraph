import { Plugin, PluginInitArgs } from 'base/plugin';
import { ObjectWithId } from 'base/types';
import { isNil } from 'lodash-es';
import { fitIn } from 'utils';
import { Network } from 'vis-network';

type IZoomLimitPlugin = Plugin<
  'zoomlimit',
  ObjectWithId,
  ObjectWithId,
  unknown
>;

export type ZoomLimit = [number, number];

interface ZoomEvent {
  scale: number;
}

export class ZoomLimitPlugin implements IZoomLimitPlugin {
  private engine?: Network;

  readonly id = 'zoomlimit';

  constructor(private limit: ZoomLimit = [0.1, 10]) {}

  private readonly onZoom = ({ scale }: ZoomEvent) => {
    if (isNil(this.engine)) {
      return;
    }

    const fitScale = fitIn(scale, this.limit);

    if (scale !== fitScale) {
      this.engine.moveTo({
        scale: fitScale,
        position: this.engine.getViewPosition(),
      });
    }
  };

  init({ engine }: PluginInitArgs<IZoomLimitPlugin>) {
    this.engine = engine;

    this.engine.on('zoom', this.onZoom);
  }

  dispose() {
    this.engine?.off('zoom', this.onZoom);
  }
}
