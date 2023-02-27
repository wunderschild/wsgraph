import { Plugin, PluginInitArgs } from 'base/plugin';
import {
  DatasetCapture,
  GraphDataset,
  ObjectId,
  ObjectWithId,
} from 'base/types';
import { difference, isEmpty, isNil, unset } from 'lodash-es';
import { Network } from 'vis-network';

export interface PinnableNode extends ObjectWithId {
  fixed: boolean;
}

type IAutopinPlugin<N extends PinnableNode, E extends ObjectWithId> = Plugin<
  'autopin',
  N,
  E,
  unknown
>;

const isNotNil = <T>(value: T): value is NonNullable<T> => !isNil(value);

export class AutopinPlugin<N extends PinnableNode, E extends ObjectWithId>
  implements IAutopinPlugin<N, E>
{
  private engine?: Network;

  private dataset?: GraphDataset<N, E>;

  private pinnedNodes: Record<ObjectId, boolean> = {};

  private draggingNow = false;

  private afterDraggingQueue: (() => unknown)[] = [];

  readonly id = 'autopin';

  private readonly onDragStart = ({
    nodes: nodeIds,
  }: {
    nodes: ObjectId[];
  }) => {
    this.draggingNow = true;
    this.setNodesPinState(nodeIds, false);
  };

  private readonly onDragEnd = ({ nodes: nodeIds }: { nodes: ObjectId[] }) => {
    this.setNodesPinState(nodeIds, true);

    this.draggingNow = false;
    while (!isEmpty(this.afterDraggingQueue)) {
      const value = this.afterDraggingQueue.shift();

      if (!isNil(value)) value();
    }
  };

  private setNodesPinState(nodeIds: ObjectId[], pin: boolean) {
    if (isNil(this.engine) || isNil(this.dataset)) {
      return;
    }

    const targetNodes = nodeIds
      .map(id => this.dataset?.nodes.get(id))
      .filter(isNotNil);

    for (const targetNode of targetNodes) {
      this.dataset.nodes.updateOnly([{ ...targetNode, fixed: pin }]);
      this.pinnedNodes[targetNode.id] = pin;
    }
  }

  init({ engine, dataset }: PluginInitArgs<IAutopinPlugin<N, E>>) {
    this.dataset = dataset;
    this.engine = engine;

    console.debug('autopin init');
    console.debug('  engine = %O', this.engine);
    console.debug('  dataset = %O', this.dataset);

    this.engine.on('dragStart', this.onDragStart);

    this.engine.on('dragEnd', this.onDragEnd);
  }

  dispose() {
    this.engine?.off('dragStart', this.onDragStart);
    this.engine?.off('dragEnd', this.onDragEnd);
  }

  onDatasetChanged({ nodes }: DatasetCapture<N, E>) {
    if (isNil(this.engine) || isNil(this.dataset)) {
      return;
    }

    const deletedIds = difference(
      nodes.map(({ id }) => id),
      this.dataset.nodes.getIds(),
    );

    for (const id of deletedIds) {
      unset(this.pinnedNodes, id);
    }

    this.whenNotDragging(() =>
      this.setNodesPinState(
        this.dataset?.nodes.getIds().filter(id => this.pinnedNodes[id]) ?? [],
        true,
      ),
    );
  }

  whenNotDragging(action: () => unknown) {
    if (!this.draggingNow) {
      action();
    }
  }
}
