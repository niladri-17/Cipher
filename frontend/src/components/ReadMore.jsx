// ReadMore.jsx
import React, { useState } from "react";

const ReadMore = ({ text, maxWords = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split text into words
  const words = text.split(" ");

  // If text is shorter than maxWords, no need for truncation
  if (words.length <= maxWords) {
    return <>{text}</>;
  }

  // Truncated and full text versions
  const truncatedText = words.slice(0, maxWords).join(" ") + "...";

  return (
    <>
      <>{isExpanded ? text : truncatedText}</>
      <span
        className="text-blue-500 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Read Less" : "Read More"}
      </span>
    </>
  );
};

export default ReadMore;
