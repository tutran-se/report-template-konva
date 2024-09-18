"use client";
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Transformer, Text } from "react-konva";

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      <Text
        x={shapeProps.x}
        y={shapeProps.y}
        width={shapeProps.width}
        height={shapeProps.height}
        text={shapeProps.text}
        fontSize={16}
        fill="black"
        align="center"
        verticalAlign="middle"
        listening={false}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: "red",
    id: "rect1",
    text: "Hello",
  },
];

const Test2 = () => {
  const [rectangles, setRectangles] = useState(initialRectangles);
  const [selectedId, selectShape] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [text, setText] = useState("");
  const [editingText, setEditingText] = useState("");
  const popupRef = useRef(null);

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
      setShowPopup(false);
    }
  };

  const handleSaveEdit = () => {
    setRectangles(
      rectangles.map((rect) =>
        rect.id === selectedId ? { ...rect, text: editingText } : rect
      )
    );
    setShowPopup(false);
  };

  const handleDelete = () => {
    setRectangles(rectangles.filter((rect) => rect.id !== selectedId));
    selectShape(null);
    setShowPopup(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Delete" && selectedId) {
      handleDelete();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, rectangles]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addNewElement = (e) => {
    e.preventDefault();

    const newId = `rect${rectangles.length + 1}`;
    const newElement = {
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      fill: "green",
      id: newId,
      text,
    };

    setRectangles([...rectangles, newElement]);
    setText("");
  };

  return (
    <div>
      <form onSubmit={addNewElement}>
        <input
          className="inline-block p-2 border border-gray-600 mr-6"
          type="text"
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="border p-4 border-gray-600 mb-6">
          Add new element
        </button>
      </form>
      <div className="bg-indigo-100 relative">
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            {rectangles.map((rect, i) => {
              return (
                <Rectangle
                  key={i}
                  shapeProps={rect}
                  isSelected={rect.id === selectedId}
                  onSelect={() => {
                    selectShape(rect.id);
                    setShowPopup(true);
                    setPopupPosition({
                      x: rect.x + rect.width / 2,
                      y: rect.y + rect.height / 2,
                    });
                    setEditingText(rect.text);
                  }}
                  onChange={(newAttrs) => {
                    const rects = rectangles.slice();
                    rects[i] = newAttrs;
                    setRectangles(rects);
                  }}
                />
              );
            })}
          </Layer>
        </Stage>
        {showPopup && (
          <div
            ref={popupRef}
            style={{
              position: "absolute",
              left: popupPosition.x,
              top: popupPosition.y,
              background: "white",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            }}
          >
            <input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="mb-2 p-1 border rounded"
            />
            <div>
              <button onClick={handleSaveEdit} className="mr-2">
                Save
              </button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Test2;
