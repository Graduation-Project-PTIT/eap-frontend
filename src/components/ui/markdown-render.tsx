import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface MarkdownRenderProps {
  content: string;
}

const MarkdownRender = ({ content }: MarkdownRenderProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        // Custom styling for headings
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h4>
        ),
        // Custom styling for horizontal rules
        hr: () => <hr className="my-6 border-t border-border" />,
        // Custom styling for lists
        ul: ({ children }) => <ul className="list-disc mb-4 space-y-2 pl-6">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal mb-4 space-y-2 pl-6">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        // Custom styling for code
        code: ({ children, className }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>
          ) : (
            <code className={className}>{children}</code>
          );
        },
        // Custom styling for pre (code blocks)
        pre: ({ children }) => (
          <pre className="bg-muted p-3 rounded-md mb-4 overflow-x-auto max-w-full">
            <code className="text-sm font-mono block whitespace-pre-wrap break-words">
              {children}
            </code>
          </pre>
        ),
        // Custom styling for paragraphs
        p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
        // Custom styling for strong/bold text
        strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
        // Custom styling for emphasis/italic text
        em: ({ children }) => <em className="italic">{children}</em>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRender;
