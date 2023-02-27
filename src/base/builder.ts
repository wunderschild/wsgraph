import createGraphComponent from 'base/component/GraphComponent';
import { TypeHolder } from 'utils';
import { Plugin } from './plugin';
import { ObjectWithId, VisConfig } from './types';

export interface GraphInitializer<
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
  PluginContext,
> {
  config: VisConfig;

  plugins: Plugin<string, NodeType, EdgeType, PluginContext>[];
}

class GraphBuilder<
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
  PluginContext,
> {
  constructor(
    private initializer: GraphInitializer<NodeType, EdgeType, PluginContext>,
  ) {}

  plugin = <PluginIn extends Plugin<string, NodeType, EdgeType, PluginContext>>(
    plugin: PluginIn,
  ): GraphBuilder<NodeType, EdgeType, PluginContext> =>
    new GraphBuilder<NodeType, EdgeType, PluginContext>({
      ...this.initializer,
      plugins: [...this.initializer.plugins, plugin],
    });

  build = () => createGraphComponent(this.initializer);
}

export const buildGraph = <
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
  PluginContext = undefined,
>(
  visConfig: VisConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contextType?: TypeHolder<PluginContext>,
): GraphBuilder<NodeType, EdgeType, PluginContext> =>
  new GraphBuilder<NodeType, EdgeType, PluginContext>({
    config: visConfig,
    plugins: [],
  });
