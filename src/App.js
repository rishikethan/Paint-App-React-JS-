import React, { useState, useRef, useEffect } from 'react';
// import { produce } from 'immer';
import './App.css';

const App = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('draw'); // 'draw' or 'eraser'
  const [history, setHistory] = useState([]); // For undo/redo
  const [currentStep, setCurrentStep] = useState(-1); // Track current drawing step

  // Initialize canvas context
  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    return canvas.getContext('2d');
  };

  // Start drawing
  const startDrawing = (e) => {
    const ctx = getCanvasContext();
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  // Draw on canvas
  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = getCanvasContext();

    if (tool === 'draw') {
      ctx.strokeStyle = color;
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF'; // White for eraser
    }

    ctx.lineWidth = brushSize;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Save the current state for undo/redo
    saveHistory();
  };

  // Clear the canvas
  const clearCanvas = () => {
    const ctx = getCanvasContext();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistory();
  };

  // Undo the last drawing action
  const undo = () => {
    if (currentStep <= 0) return;
    setCurrentStep(currentStep - 1);
    restoreHistory(currentStep - 1);
  };

  // Redo the last undone action
  const redo = () => {
    if (currentStep >= history.length - 1) return;
    setCurrentStep(currentStep + 1);
    restoreHistory(currentStep + 1);
  };

  // Save the current canvas state to history
  const saveHistory = () => {
    const ctx = getCanvasContext();
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, currentStep + 1); // Trim forward history
    newHistory.push(imageData);
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  // Restore the canvas from history
  const restoreHistory = (step) => {
    const ctx = getCanvasContext();
    const imageData = history[step];
    ctx.putImageData(imageData, 0, 0);
  };

  // Save the drawing as an image
  const saveImage = () => {
    const canvas = canvasRef.current;
    const imageUrl = canvas.toDataURL();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'drawing.png';
    link.click();
  };

  // Adjust canvas size when the window resizes
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight * 0.6;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Set initial size

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Handle active button styling
  const buttonClass = (toolName) => (tool === toolName ? 'active-button' : '');

  return (
    <div className="App">
      <h1>React Paint App</h1>

      <div className="controls">
        <label>Brush Size:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(e.target.value)}
        />
        
        <label>Color: </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <div>
          <button className={buttonClass('draw')} onClick={() => setTool('draw')}>Draw</button>
          <button className={buttonClass('eraser')} onClick={() => setTool('eraser')}>Eraser</button>
        </div>

        <button className={buttonClass('clear')} onClick={clearCanvas}>Clear Canvas</button>
        <button className={buttonClass('undo')} onClick={undo}>Undo</button>
        <button className={buttonClass('redo')} onClick={redo}>Redo</button>
        <button className={buttonClass('save')} onClick={saveImage}>Save Image</button>
      </div>

      <canvas
        ref={canvasRef}
        style={{ border: '1px solid #000', cursor: 'crosshair' }}
        width="800"
        height="600"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default App;



// This React component implements a simple drawing application that allows users to draw, erase, undo, redo, and save their work. 
// Here's a detailed explanation of how the application works:

// ### 1. **State Management**:

// The app uses React’s `useState` hook to manage the state of various components:

// - `isDrawing`: Tracks whether the user is currently drawing on the canvas.
// - `color`: Stores the selected color for the brush.
// - `brushSize`: Controls the size of the brush.
// - `tool`: A string that determines which tool the user is using, either 'draw' or 'eraser'.
// - `history`: Stores the drawing history for undo/redo functionality.
// - `currentStep`: Tracks the current step in the history for undo/redo.

// ### 2. **Canvas Setup**:

// - `canvasRef`: A reference to the HTML canvas element that enables direct access to it.
// - `getCanvasContext()`: This function gets the 2D context of the canvas, which is used to draw on it.

// ### 3. **Drawing Logic**:

// - **startDrawing**: This function is called when the user clicks on the canvas (mouse down event). It starts a new path and
// moves the pen to the location where the mouse is clicked.
  
// - **draw**: This function is called as the mouse moves while the user is holding down the mouse button. It draws on the canvas,
// either in the selected `color` (for drawing) or in white (`#FFFFFF`) for erasing.

// - **stopDrawing**: This function is called when the user releases the mouse or the mouse leaves the canvas. It stops the 
//drawing process and saves the current state of the canvas to `history`.

// ### 4. **Undo/Redo Functionality**:

// - **saveHistory**: This function saves the current state of the canvas to the `history` array. Each drawing action (or change)
// is captured as `imageData`, which is stored in the history so that it can be retrieved later for undo/redo functionality.
  
// - **restoreHistory**: This function restores a previous state of the canvas by using `putImageData`, which takes the 
//`imageData` saved in `history`.

// - **undo**: When called, it moves the `currentStep` back in history (if possible), which allows the user to go back to a
// previous drawing state.

// - **redo**: When called, it moves the `currentStep` forward in history (if possible), restoring the last undone drawing action.

// ### 5. **Canvas Resizing**:

// - The `useEffect` hook listens for window resize events and resizes the canvas to be 80% of the window width and 60% of the 
//window height. This ensures that the canvas adjusts its size dynamically when the window is resized.

// ### 6. **Tool Selection and Button Styling**:

// - The app allows the user to toggle between the "draw" and "eraser" tools. 
//   - The buttons for these tools (`Draw` and `Eraser`) use the `buttonClass` function to apply an `active-button` class if the 
//current tool is selected, highlighting the active tool.

// ### 7. **Save Image**:

// - The `saveImage` function converts the canvas drawing to a PNG image using `toDataURL`. It then creates a temporary download 
//link and triggers a download of the image as `drawing.png`.

// ### 8. **Canvas Event Handling**:

// - The canvas listens for mouse events:
//   - `onMouseDown`: Starts the drawing process.
//   - `onMouseMove`: Draws or erases when the mouse is moving.
//   - `onMouseUp` and `onMouseLeave`: Stops drawing when the user releases the mouse or moves the cursor off the canvas.

// ### 9. **Controls**:

// The control panel consists of:
// - A slider (`input[type="range"]`) to adjust the `brushSize`.
// - A color picker (`input[type="color"]`) to change the `color` of the brush.
// - Buttons for:
//   - Switching between `draw` and `eraser` tools.
//   - Clearing the canvas.
//   - Undoing and redoing actions.
//   - Saving the image as a PNG file.

// ### 10. **CSS Styling**:

// The component also imports a CSS file (`App.css`) to style the application. You can define styles for buttons, canvas, 
//input fields, and overall layout in that CSS file.

// ### Summary:

// This app is a simple React-based paint application where users can:
// - Draw and erase on a canvas.
// - Change brush size and color.
// - Undo and redo drawing actions.
// - Clear the canvas.
// - Save their drawing as an image file.

// It is built using basic React hooks and canvas API methods to allow users to interact with a drawing surface in a dynamic and 
//intuitive way. The app also adapts to window resizing for a responsive design.
