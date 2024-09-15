import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { isSafari } from "react-device-detect";

const ReactMarkdown = ({
  children,
}: {
  children: string | null | undefined;
}) => {
  try {
    return (
      <Markdown
        className="prose sm:prose-sm lg:prose-base"
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
  } catch {
    return (
      <div className="m-2">
        <h2 className="text-lg font-bold">
          Looks like your device is bugging out with Markdown rendering for some
          reason. The following will be the raw md file so not super pretty, but
          hopefully better than nothing.
        </h2>
        <div>{children}</div>
      </div>
    );
  }
};

export default ReactMarkdown;
