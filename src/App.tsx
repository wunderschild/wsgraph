import { buildGraph } from 'base/builder';
import { ObjectId, ObjectWithId } from 'base/types';
import BasicContextMenuRenderer from 'default/BasicContextMenuRenderer';
import BasicControlsRenderer from 'default/BasicControlsRenderer';
import { random, uniqueId } from 'lodash-es';
import { AutopinPlugin } from 'plugins/autopin';
import { action, ContextMenuPlugin, divider, menu } from 'plugins/context';
import { GraphControlsPlugin } from 'plugins/controls';
import { PopoverPlugin, popovers, PopoversContext } from 'plugins/popover';
import { useCallback, useState } from 'react';
import { Position2D } from 'utils/overlay';
import './App.css';

interface TestNode {
  id: ObjectId;
  fixed: boolean;
  label: string;
}

const menuConfig = menu({
  node: [
    action({
      id: 'nodeAdd',
      text: 'Add node',
      onTrigger: (event, context) =>
        console.log('nodeAdd: %O %O', event, context),
    }),
    divider(),
  ],
});

const contextMenu = () =>
  new ContextMenuPlugin(menuConfig, BasicContextMenuRenderer);

const controls = () =>
  new GraphControlsPlugin(
    {
      zoomLimits: [0.1, 10.0],
    },
    BasicControlsRenderer,
  );

const popoversConfig = popovers({})
  .popover({
    id: 'newNode',
    render: (name: string) => (
      <div style={{ backgroundColor: 'red', padding: 10, color: 'white' }}>
        New node added {name}!
      </div>
    ),
  })
  .build();

type GraphContext = PopoversContext<typeof popoversConfig>;

const Graph = buildGraph<TestNode, ObjectWithId, GraphContext>({
  physics: {
    enabled: true,
    stabilization: false,
    minVelocity: 0.01,
  },
})
  .plugin(contextMenu)
  .plugin(controls)
  .plugin(() => new AutopinPlugin())
  .plugin(() => new PopoverPlugin(popoversConfig))
  .build();

const randomPosition = (min: Position2D, max: Position2D) => ({
  x: random(min.x, max.x),
  y: random(min.y, max.y),
});

const App = () => {
  const [nodes, setNodes] = useState<TestNode[]>([]);
  const [name, setName] = useState<string>('');

  const [ctx, setCtx] = useState<GraphContext>({
    displayedPopovers: [],
  });

  const addNode = useCallback(() => {
    const newNode = {
      id: uniqueId('node-'),
      fixed: false,
      label: name,
    };

    setCtx({
      displayedPopovers: [
        {
          id: 'newNode',
          position: randomPosition({ x: 100, y: 100 }, { x: 350, y: 350 }),
          args: name,
        },
      ],
    });

    setNodes(prevNodes => [...prevNodes, newNode]);
  }, [name]);

  const dropNode = useCallback((delId: ObjectId) => {
    setNodes(prevNodes => prevNodes.filter(({ id }) => delId !== id));
  }, []);

  return (
    <div className={'App'}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          border: '1px solid red',
          zIndex: 100,
        }}
      >
        <form onSubmit={addNode} action={'#'}>
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
          <button type={'submit'}>+</button>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {nodes.map(({ id, label }) => (
            <div
              key={id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: 4,
                justifyContent: 'space-evenly',
              }}
            >
              <code>{id}</code>
              <div>{label}</div>
              <button onClick={() => dropNode(id)}>&times;</button>
            </div>
          ))}
        </div>
      </div>
      <div className={'wgApp'}>
        <Graph
          edges={[]}
          nodes={nodes}
          pluginContext={ctx}
          wrapperClassName={'wgApp'}
        />
      </div>
    </div>
  );
};

export default App;
