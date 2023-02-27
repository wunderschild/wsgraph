import { DatasetCapture, GraphDataset, ObjectWithId } from 'base/types';
import React from 'react';
import { Network } from 'vis-network';

export interface PluginInitArgs3<
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
  PluginContext,
> {
  engine: Network;
  dataset: GraphDataset<NodeType, EdgeType>;
  context: PluginContext;
}

export type PluginInitArgs<P> = P extends Plugin<
  string,
  infer NodeType,
  infer EdgeType,
  infer PluginContext
>
  ? PluginInitArgs3<NodeType, EdgeType, PluginContext>
  : never;

type PluginInit<
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
  PluginContext,
> = (
  args: PluginInitArgs3<NodeType, EdgeType, PluginContext>,
) => Promise<void> | void;

export interface Plugin<
  Id extends string,
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
  PluginContext,
> {
  readonly id: Id;

  init?: PluginInit<NodeType, EdgeType, PluginContext>;

  dispose?: () => unknown;

  onContextChanged?: (context: PluginContext) => unknown;

  onDatasetChanged?: (
    oldDataset: DatasetCapture<NodeType, EdgeType>,
  ) => unknown;

  render?: () => React.ReactNode;
}
