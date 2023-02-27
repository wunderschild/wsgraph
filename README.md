# WSGraph

This is a React wrapper for [Vis.js Network](https://github.com/visjs/vis-network) library.
Besides just handling React/Vis interaction, this library provides an ability to write interaction plugins.

## Usage

Consider the following source code fragment:

```typescript jsx
import React, { useState } from 'react';

import { buildGraph, ObjectId } from '@wunderschild/wsgraph';
import { AutopinPlugin } from '@wunderschild/wsgraph/plugins/autopin';

interface MyNode { // 1
  id: ObjectId;
  label: string;
}

interface MyEdge {
  id: ObjectId;

  source: ObjectId;
  target: ObjectId;
}

type MyContext = undefined; // 2

const Graph = buildGraph<MyNode, MyEdge, MyContext>({ // 3
  physics: {
    enabled: true,
    stabilization: false,
    minVelocity: 0.01,
  },
})
  .plugin(new AutopinPlugin()) // 4
  .build();

const MyGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<MyNode[]>([]);
  const [edges, setEdges] = useState<MyEdge[]>([]);

  return (
    <div>
      <Graph
        nodes={nodes}
        edges={edges}
        pluginContext={undefined}
      />
    </div>
  );
}

```

1. We declare our own interfaces for nodes and edges here.
   The only requirement for these types is that those should be
   compatible with the `ObjectWithId` type, which is also exported
   and looks like the following:

```typescript
interface ObjectWithId {
  id: ObjectId;
}
```

2. This is the type of plugin context.
   Since plugins are expected to be configured statically (for performance reasons mostly),
   there will be no possibility to access React component context directly (e.g. trigger `setState`).
   Instead, you can pass all the context needed through the `pluginContext` property, making it accessible from
   plugins. E.g. the bundled context menu plugin exposes plugin context as a parameter to all context menu callbacks.

3. This object passed as an argument to `buildGraph` is basically a `vis-network` `Options` object. Please look into
   [their docs](https://visjs.github.io/vis-network/docs/network/#options) for details.

4. Let us add a plugin here. This particular bundled plugin controls node physics.
   After dragging a node, it becomes fixed. That means that even if node is still participating in physics
   simulation, it can no longer move unless the used decides to move it manually.

## Bundled plugins

**TODO** Write docs

## Developing plugins

**TODO** Write docs
