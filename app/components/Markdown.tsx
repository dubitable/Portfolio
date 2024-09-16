import Markdown from "markdown-to-jsx";

const ReactMarkdown = ({ children }: { children: string }) => {
  console.log(children);
  return (
    <div className="prose">
      <Markdown>{children}</Markdown>
    </div>
  );
};

export default ReactMarkdown;
