import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./Tooltip.css";

export default function Tooltip({ text, mouseOffset }) {
  const [mousePosition, setMousePosition] = useState({
    x: null,
    y: null,
  });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <article
      className="mouse-tracker"
      style={{
        transform: `translate(${mousePosition.x + mouseOffset.x}px, ${
          mousePosition.y + mouseOffset.y
        }px)`,
      }}
    >
      <div>{text}</div>
    </article>
  );
}

Tooltip.propTypes = {
  text: PropTypes.string.isRequired,
  mouseOffset: PropTypes.object.isRequired,
};
