import { GraphInitializer } from 'base/builder';
import { DatasetCapture, ObjectWithId } from 'base/types';
import usePatchedDataset from 'base/usePatchedDataset';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';
import classes from './GraphComponent.module.scss';

export interface GraphComponentProps<
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
  PluginContext,
> {
  containerClassName?: string;
  wrapperClassName?: string;

  nodes: readonly NodeType[];
  edges: readonly EdgeType[];

  pluginContext: PluginContext;
}

const createGraphComponent = <
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
  PluginContext,
>({
  config,
  plugins: pluginFactories,
}: GraphInitializer<NodeType, EdgeType, PluginContext>): React.FC<
  GraphComponentProps<NodeType, EdgeType, PluginContext>
> => {
  return ({
    containerClassName,
    wrapperClassName,
    nodes: nodesIn,
    edges: edgesIn,
    pluginContext,
  }) => {
    const plugins = useMemo(() => {
      console.log('instantiate plugins');
      return pluginFactories.map(f => f());
    }, [pluginFactories]);

    const container = useRef<HTMLDivElement>(null);
    const vis = useRef<Network>();

    const nodes = useRef<DataSet<NodeType>>(new DataSet<NodeType>());
    const edges = useRef<DataSet<EdgeType>>(new DataSet<EdgeType>());

    const data = useMemo(
      () => ({
        nodes: nodes.current,
        edges: edges.current,
      }),
      [nodes.current, edges.current],
    );

    useEffect(() => {
      const { current } = container;

      if (!isNil(current)) {
        vis.current = new Network(current, data, {
          ...config,
          autoResize: true,
        });
      }
    }, [container, data]);

    // region Init plugins
    useEffect(() => {
      const engine = vis.current;

      if (!isNil(engine)) {
        plugins.map(plugin => {
          if (!isNil(plugin.init)) {
            return plugin.init({
              engine,
              dataset: data,
              context: pluginContext,
            });
          }
        });
      }

      return () => {
        if (!isNil(engine)) {
          plugins.map(plugin => {
            if (!isNil(plugin.dispose)) {
              return plugin.dispose();
            }
          });
        }
      };
    }, [vis]);
    // endregion

    useEffect(() => {
      for (const plugin of plugins) {
        if (!isNil(plugin.onContextChanged)) {
          plugin.onContextChanged(pluginContext);
        }
      }
    }, [pluginContext]);

    const onDatasetChanged = useCallback(
      (capturePartial: Partial<DatasetCapture<NodeType, EdgeType>>) => {
        const capture = {
          nodes: capturePartial.nodes ?? data.nodes.get(),
          edges: capturePartial.edges ?? data.edges.get(),
        };

        for (const plugin of plugins) {
          if (!isNil(plugin.onDatasetChanged)) {
            plugin.onDatasetChanged(capture);
          }
        }
      },
      [],
    );

    usePatchedDataset(data.nodes, nodesIn, nodesCap =>
      onDatasetChanged({ nodes: nodesCap }),
    );
    usePatchedDataset(data.edges, edgesIn, edgesCap =>
      onDatasetChanged({ edges: edgesCap }),
    );

    return React.createElement(
      'div',
      {
        className: classNames(classes.wrapper, wrapperClassName),
      },
      [
        React.createElement('div', {
          ref: container,
          className: classNames(classes.container, containerClassName),
        }),
        React.createElement(
          React.Fragment,
          {},
          plugins.map(it => (isNil(it.render) ? null : it.render())),
        ),
      ],
    );
  };
};

export default createGraphComponent;
