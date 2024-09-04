import React from "react";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import gfm from "remark-gfm";

const MarkdownRenderer = ({ markdown = "" }) => {
  // Ensure markdown is a string
  const cleanText = typeof markdown === "string" ? markdown.replace(/```/g, "") : "";
  const sanitizedMarkdown = DOMPurify.sanitize(cleanText);

  return (
    <ReactMarkdown
      children={sanitizedMarkdown}
      remarkPlugins={[gfm]}
      components={{
        p: ({ node, children, ...props }) => (
          <p style={{ margin: "0.5em 0" }} {...props}>
            {children}
          </p>
        ),
        ul: ({ node, children, ...props }) => (
          <ul style={{ margin: "0.5em 0" }} {...props}>
            {children}
          </ul>
        ),
        ol: ({ node, children, ...props }) => (
          <ol style={{ margin: "0.5em 0" }} {...props}>
            {children}
          </ol>
        ),
        li: ({ node, children, ...props }) => (
          <li style={{ margin: "0.25em 0" }} {...props}>
            {children}
          </li>
        ),
        h3: ({ node, children, ...props }) => (
          <h3 style={{ marginTop: "1em", marginBottom: "0.5em" }} {...props}>
            {children}
          </h3>
        ),
        a: ({ node, children, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer">
            {children || "Link"}
          </a>
        ),
        img: ({ node, ...props }) => (
          <img alt="markdown-img" style={{ maxWidth: "100%" }} {...props} />
        ),
        code: ({ node, inline, className, children, ...props }) => (
          <code style={{ whiteSpace: "pre-wrap" }} {...props}>
            {children}
          </code>
        ),
      }}
    />
  );
};

export default MarkdownRenderer;