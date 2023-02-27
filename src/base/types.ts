import { DataSet } from 'vis-data';
import { Options } from 'vis-network';

export type ObjectId = string | number;

export interface ObjectWithId {
  id: ObjectId;
}

export interface GraphDataset<
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
> {
  nodes: DataSet<NodeType>;
  edges: DataSet<EdgeType>;
}

export interface DatasetCapture<
  NodeType extends ObjectWithId,
  EdgeType extends ObjectWithId,
> {
  nodes: NodeType[];
  edges: EdgeType[];
}

export type VisConfig = Omit<Options, 'autoResize'>;
