import React, { useState, useEffect } from "react";
import Markdown from "../Helper/MarkdownRenderer";

function TextStreamer({ text, speed = 50, onUpdate }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => {
          const newText = prev + text.charAt(index);
          if (onUpdate) onUpdate(newText);
          return newText;
        });
        setIndex((prevIndex) => prevIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [index, text, speed, onUpdate]);

  useEffect(() => {
    if (onUpdate) onUpdate(displayedText);
  }, [displayedText, onUpdate]);

  return <Markdown markdown={displayedText} />;
}

export default TextStreamer;
