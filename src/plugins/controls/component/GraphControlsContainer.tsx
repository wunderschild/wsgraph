import { GraphControls } from 'plugins/controls/plugin';
import React from 'react';

export interface GraphControlRendererProps {
  controls: GraphControls;
  initialZoom: number;
}

export type GraphControlsRenderer =
  React.ComponentType<GraphControlRendererProps>;

export interface GraphControlsContainerProps extends GraphControlRendererProps {
  renderer: GraphControlsRenderer;
}

const GraphControlsContainer: React.FC<GraphControlsContainerProps> = ({
  controls,
  initialZoom,
  renderer: Renderer,
}) => <Renderer controls={controls} initialZoom={initialZoom} />;

export default GraphControlsContainer;
