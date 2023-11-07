import React, { useContext, useEffect, useRef, useState } from 'react';
// Components
import Navbar from '../../components/nav/Navbar';
import DesignDataBar from '../../components/design/DesignDataBar';
// Context
import { ToggleContext } from '../../context/ToggleContext';
import CanvasDesignTool from '../../components/canvas/CanvasDesignTool';

function DesignPage() {
  const { setActiveNav } = useContext(ToggleContext);

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const marketNumRef = useRef(1);
  const lineRef = useRef([]);
  const emptyRef = useRef([]);

  const [dataCollection, setDataCollection] = useState([]);

  useEffect(() => {
    setActiveNav('/design');
  }, []);

  const clearDataPoints = (event) => {
    event.preventDefault();
    console.log('CLEAR', event.target.id);
    lineRef.current = emptyRef.current;
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    marketNumRef.current = 1;
    setDataCollection([]);
  };

  const drawConnectingLines = () => {
    console.log('draw');

    // add to array of points
    const tempStore = lineRef.current;
    lineRef.current = tempStore;

    if (tempStore.length > 2) {
      // Draw line from start to finish
      let start = tempStore[0];
      let finish = tempStore[tempStore.length - 1];
      console.log('start.', start);
      console.log('finsi', finish);

      contextRef.current.beginPath();
      contextRef.current.moveTo(start.xpos, start.ypos);
      contextRef.current.lineTo(finish.xpos, finish.ypos);
      contextRef.current.stroke();

      let previousRef = start;

      for (let index = 1; index < tempStore.length; index++) {
        const element = tempStore[index];
        console.log('element', element);

        contextRef.current.beginPath();
        contextRef.current.moveTo(previousRef.xpos, previousRef.ypos);
        contextRef.current.lineTo(element.xpos, element.ypos);
        contextRef.current.stroke();
        previousRef = element;
      }
    }
  };

  return (
    <div className='grid main__bg font-poppins h-screen grid-rows-reg overflow-hidden max-h-screen'>
      <Navbar />
      {/* Main */}
      <main className='grid h-full grid-cols-rev overflow-hidden'>
        {/* canvas */}
        <section className='grid grid-rows-reg gap-4 p-4 overflow-hidden'>
          <div className='grid grid-flow-col justify-between'>
            <article>
              <h1 className='text-xl font-semibold'>Design Your Polygon</h1>
            </article>
            <div className='flex gap-4'>
              <button
                onClick={drawConnectingLines}
                className='px-4 py-2 outline-black outline outline-2 active:scale-95 no__highlights bg-yellow-400 hover:bg-yellow-100 rounded-xl'
              >
                Draw
              </button>
              <button
                onClick={clearDataPoints}
                className='px-4 py-2 outline-black outline outline-2 active:scale-95 no__highlights bg-red-400 hover:bg-red-100 rounded-xl'
              >
                Reset
              </button>
            </div>
          </div>
          {/* CANVAS */}
          <div className='bg-white h-full grid outline-black outline outline-2 overflow-hidden'>
            <CanvasDesignTool
              canvasRef={canvasRef}
              contextRef={contextRef}
              marketNumRef={marketNumRef}
              lineRef={lineRef}
              setDataCollection={setDataCollection}
              dataCollection={dataCollection}
              drawConnectingLines={drawConnectingLines}
            />
          </div>
        </section>
        {/* data bar */}
        <section className='grid'>
          <DesignDataBar
            dataCollection={dataCollection}
            setDataCollection={setDataCollection}
            lineRef={lineRef}
            clearDataPoints={clearDataPoints}
          />
        </section>
      </main>
    </div>
  );
}

export default DesignPage;
