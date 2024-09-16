import Markdown from "markdown-to-jsx";

const ReactMarkdown = ({ children }: { children: string }) => {
  return (
    <div className="prose">
      <Markdown>{children}</Markdown>
    </div>
  );
};

export default ReactMarkdown;
