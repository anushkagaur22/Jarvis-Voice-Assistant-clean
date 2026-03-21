import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/atom-one-dark.css";

export default function MessageBubble({
  role,
  content = "",
  animate = true,
  onComplete
}) {

  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {

    if (!content) return;

    // User messages always instant
    if (role === "user" || !animate) {
      setDisplayedContent(content);
      return;
    }

    // Typing animation only for NEW assistant responses
    setDisplayedContent("");
    setIsTyping(true);

    let index = 0;
    const speed = 15;

    const interval = setInterval(() => {

      index++;

      setDisplayedContent(content.slice(0, index));

      if (index >= content.length) {
        clearInterval(interval);
        setIsTyping(false);
        onComplete && onComplete();
      }

    }, speed);

    return () => clearInterval(interval);

  }, [content, role, animate]);

  return (
    <div className={`chat-bubble ${role}`}>

      <ReactMarkdown>
        {displayedContent}
      </ReactMarkdown>

      {isTyping && <span className="typing-cursor">|</span>}

    </div>
  );
}