import React, { useEffect, useRef } from 'react';

function CanvasDesignTool({
  canvasRef,
  contextRef,
  marketNumRef,
  lineRef,
  dataCollection,
  setDataCollection,
}) {
  useEffect(() => {
    // returns <context>
    const canvas = canvasRef.current;
    var rect = canvas.parentNode.getBoundingClientRect();

    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // set canvas to visible colour
    canvas.style.backgroundColor = '#bee0ec';

    const context = canvas.getContext('2d');

    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);

  const createMarker = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    console.log('offsetX', offsetX);
    console.log('offsetY', offsetY);

    contextRef.current.beginPath();
    contextRef.current.arc(
      nativeEvent.offsetX,
      nativeEvent.offsetY,
      1,
      0,
      2 * Math.PI,
      true
    );
    contextRef.current.stroke();
    contextRef.current.fillText(
      marketNumRef.current,
      nativeEvent.offsetX + 5,
      nativeEvent.offsetY + 5
    );
    marketNumRef.current++;
    console.log('9B. contextRef.current', contextRef.current);
    console.log('10. lineRef', lineRef);

    // add to array of points
    const tempStore = lineRef.current;
    console.log('12. TempStore', tempStore);
    const newObj = {
      xpos: offsetX,
      ypos: offsetY,
    };
    tempStore.push(newObj);
    setDataCollection([...dataCollection, newObj]);

    lineRef.current = tempStore;
  };

  return <canvas ref={canvasRef} onMouseUp={createMarker} />;
}

export default CanvasDesignTool;
