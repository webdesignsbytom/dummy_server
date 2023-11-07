import React, { useEffect, useState, useRef } from 'react';

function TestPage() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const marketNumRef = useRef(1);
  const lineRef = useRef([]);

  console.log('10. lineRef', lineRef);
  // Returns null
  console.log('1. canvasRef', canvasRef);
  console.log('6. contextRef', contextRef);

  useEffect(() => {
    // returns <context>
    const canvas = canvasRef.current;
    console.log('2. canvas', canvas);
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    // set canvas to visible colour
    canvas.style.backgroundColor = '#bee0ec';

    console.log('3. canvas.width', canvas.width);
    console.log('4. canvas.style', canvas.style);

    const context = canvas.getContext('2d');
    console.log('5. context', context);

    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 5;
    contextRef.current = context;
    console.log('7. contextRef', contextRef);
    console.log('8. contextRef.current', contextRef.current);
  }, []);

  const createMarker = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    console.log('offsetX', offsetX);
    console.log('offsetY', offsetY);

    contextRef.current.beginPath();
    contextRef.current.arc(
      nativeEvent.x,
      nativeEvent.y,
      1,
      0,
      2 * Math.PI,
      true
    );
    contextRef.current.stroke();
    contextRef.current.fillText(
      marketNumRef.current,
      nativeEvent.x + 5,
      nativeEvent.y + 5
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

    lineRef.current = tempStore;

    if (tempStore.length > 2) {
      console.log('TTTTTTTTTTT', tempStore);

      // Draw line from start to finish
      let start = tempStore[0];
      let finish = tempStore[tempStore.length - 1];
      console.log('start.', start);
      console.log('finsi', finish);

      contextRef.current.beginPath();
      contextRef.current.moveTo(start.xpos, start.ypos);
      contextRef.current.lineTo(finish.xpos, finish.ypos);
      contextRef.current.stroke()

    }
  };


  return <canvas ref={canvasRef} onMouseUp={createMarker} />;
}

export default TestPage;
