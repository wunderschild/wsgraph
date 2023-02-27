import { GraphControlsRenderer } from 'plugins/controls/component/GraphControlsContainer';
import { useEffect, useState } from 'react';
import classes from './BasicControlsRenderer.module.scss';

const BasicControlsRenderer: GraphControlsRenderer = ({
  controls,
  initialZoom,
}) => {
  const [actualZoom, setActualZoom] = useState(initialZoom);

  useEffect(() => {
    controls.listenZoom(setActualZoom);
  }, [controls]);

  useEffect(() => {
    if (
      actualZoom <= controls.zoomLimits[0] ||
      actualZoom >= controls.zoomLimits[1]
    ) {
      controls.stopZoom(-1);
      controls.stopZoom(1);
    }
  }, [controls, actualZoom]);

  return (
    <div className={classes.container}>
      <button>{actualZoom}</button>
      <button
        disabled={actualZoom <= controls.zoomLimits[0]}
        onMouseDown={() => controls.startZoom(-1)}
        onMouseUp={() => controls.stopZoom(-1)}
        onMouseOut={() => controls.stopZoom(-1)}
        onMouseLeave={() => controls.stopZoom(-1)}
      >
        -
      </button>
      <button onClick={() => controls.fitScreen()}>*</button>
      <button
        disabled={actualZoom >= controls.zoomLimits[1]}
        onMouseDown={() => controls.startZoom(1)}
        onMouseUp={() => controls.stopZoom(1)}
        onMouseOut={() => controls.stopZoom(1)}
        onMouseLeave={() => controls.stopZoom(1)}
      >
        +
      </button>
    </div>
  );
};

export default BasicControlsRenderer;
