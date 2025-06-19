import Markdown from "markdown-to-jsx";

// TODO: fix mardown render

const ReactMarkdown = ({ children }: { children: string }) => {
  return (
    <div className="prose lg:prose-xl">
      <Markdown>{children}</Markdown>
    </div>
  );
};

export default ReactMarkdown;
