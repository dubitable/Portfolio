import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";

const ReactMarkdown = ({
  children,
}: {
  children: string | null | undefined;
}) => {
  return (
    <Markdown
      className="prose"
      remarkPlugins={[remarkGfm, remarkBreaks]}
      children={children}
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <SyntaxHighlighter
              {...(rest as SyntaxHighlighterProps)}
              PreTag="div"
              children={String(children).replace(/\n$/, "")}
              language={match[1]}
            />
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    />
  );
};

export default ReactMarkdown;
