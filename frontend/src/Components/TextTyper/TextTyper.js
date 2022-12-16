import React, { useState, useEffect } from "react";

function TextTyper({ text, speed, cursor }) {
  const [displayText, setDisplayText] = useState("");
  let index = 0;

  useEffect(() => {
    function type() {
      setDisplayText(text.substring(0, index));
      index++;

      if (index <= text.length) {
        setTimeout(type, speed);
      }
    }

    type();
  }, []);

  return (
    <>
      {displayText}
      {cursor && <span className="cursor">|</span>}
    </>
  );
}

export default TextTyper;