import { ObjectWithId } from 'base/types';
import { cloneDeep, differenceBy, noop } from 'lodash-es';
import { useEffect } from 'react';
import { DataSet } from 'vis-data';

const usePatchedDataset = <EntityType extends ObjectWithId>(
  dataset: DataSet<EntityType>,
  valuesIn: readonly EntityType[],
  onDatasetChanged: (capture: EntityType[]) => unknown = noop,
) => {
  useEffect(() => {
    const oldDataset = cloneDeep(dataset.get());

    const toAdd = differenceBy(valuesIn, dataset.get(), 'id');
    const toRemove = differenceBy(dataset.get(), valuesIn, 'id');

    dataset.add(toAdd);
    dataset.remove(toRemove);
    dataset.updateOnly(valuesIn);

    onDatasetChanged(oldDataset);
  }, [dataset, valuesIn]);
};

export default usePatchedDataset;
