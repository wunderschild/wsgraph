import { Plugin, PluginInitArgs } from 'base/plugin';
import { ObjectWithId } from 'base/types';
import { isNil } from 'lodash-es';
import GraphControlsContainer, {
  GraphControlsRenderer,
} from 'plugins/controls/component/GraphControlsContainer';
import navHandler from 'plugins/controls/navHandler';
import React from 'react';
import { Network } from 'vis-network';

export interface GraphControls {
  zoomLimits: [number, number];
  startZoom: (mux: number) => unknown;
  stopZoom: (mux: number) => unknown;

  fitScreen: () => unknown;

  listenZoom: (cb: (zoom: number) => unknown) => void;
}

type IControlsPlugin = Plugin<'controls', ObjectWithId, ObjectWithId, unknown>;

interface ControlsPluginOptions {
  zoomLimits: [number, number];
}

const muxToZoomMode = (mux: number) => (mux < 0 ? '_zoomOut' : '_zoomIn');

class GraphControlsPlugin implements IControlsPlugin {
  private engine?: Network;

  private controlsInt?: GraphControls;

  private rendererOnZoom?: (zoom: number) => unknown;

  readonly id = 'controls';

  constructor(
    private options: ControlsPluginOptions,
    private renderer: GraphControlsRenderer,
  ) {}

  private get controls() {
    if (isNil(this.controlsInt)) {
      this.controlsInt = this.createControls();
    }

    return this.controlsInt;
  }

  private readonly onZoomMaybeChanged = () => {
    if (!isNil(this.rendererOnZoom)) {
      this.rendererOnZoom(this.engine?.getScale() ?? 1);
    }
  };

  private createControls(): GraphControls {
    return {
      zoomLimits: this.options.zoomLimits,
      fitScreen: () => {
        this.engine?.fit({
          animation: true,
          maxZoomLevel: this.options.zoomLimits[1],
        });
      },
      listenZoom: cb => {
        this.rendererOnZoom = cb;
      },
      startZoom: (mux: number) => {
        navHandler(this.engine)?.bindToRedraw(muxToZoomMode(mux));
      },
      stopZoom: (mux: number) => {
        navHandler(this.engine)?.unbindFromRedraw(muxToZoomMode(mux));
      },
    };
  }

  init({ engine }: PluginInitArgs<IControlsPlugin>) {
    this.engine = engine;

    this.engine.on('zoom', this.onZoomMaybeChanged);
    this.engine.on('animationFinished', this.onZoomMaybeChanged);

    this.controlsInt = this.createControls();
  }

  dispose() {
    this.engine?.off('zoom', this.onZoomMaybeChanged);
    this.engine?.off('animationFinished', this.onZoomMaybeChanged);
  }

  render() {
    return React.createElement(GraphControlsContainer, {
      controls: this.controls,
      renderer: this.renderer,
      initialZoom: this.engine?.getScale() ?? 1,
    });
  }
}

export default GraphControlsPlugin;
