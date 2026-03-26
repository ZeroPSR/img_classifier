import React, { useState, useRef } from "react";
import { fabric } from "fabric";

export default function Annotation({ project, onBack }) {
  const canvasRef = useRef(null);
  const [annotation, setAnnotation] = useState(null);

  React.useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      width: 800,
      height: 600,
    });
    canvasRef.current = canvas;

    // Optional: You can load a default image here
    return () => canvas.dispose();
  }, []);

  const handleAddBox = () => {
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      width: 100,
      height: 100,
      fill: "rgba(0,0,0,0.3)",
      stroke: "red",
      strokeWidth: 2,
    });
    canvasRef.current.add(rect);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{project.name} - Annotation</h2>
      <button onClick={onBack}>Back to Dashboard</button>
      <button onClick={handleAddBox}>Add Box</button>
      <canvas id="canvas" style={{ border: "1px solid #ccc", marginTop: "20px" }} />
    </div>
  );
}