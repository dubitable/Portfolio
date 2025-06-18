import { Link } from "react-router";
import { format } from "light-date";
import colors from "./colors/colors";
import { BlogVersion } from "~/.server/blog";

type BlogCardProps = {
  title?: string;
  index: number;
  createdAt: Date;
  id: string;
  status: (string & {}) | "published" | "saved" | "temp";
  onEdit: () => void;
  tempBlog?: BlogVersion;
};

const BlogCard = ({
  title,
  index,
  createdAt,
  id,
  status,
  onEdit,
  tempBlog,
}: BlogCardProps) => {
  const isUser = status == "published" || status == "saved";

  const bg =
    status in colors.background
      ? colors.background[status as keyof typeof colors.background]
      : colors.background.published;

  const text =
    status in colors.text
      ? colors.text[status as keyof typeof colors.text]
      : colors.text.published;

  return (
    <article className="hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s] mx-4 lg:w-1/2">
      <div className="rounded-[10px] bg-white p-4 !pt-20 sm:p-6">
        <time dateTime="2022-10-10" className="block text-xs text-gray-500">
          {format(createdAt, "{MM}/{dd}/{yyyy}")}
        </time>

        <Link to={`/blog/${id}`} state={{ tempBlog }}>
          <h3 className="mt-0.5 text-lg font-medium text-gray-900">
            Blog {index + 1}
            {title ? `: ${title}` : null}
          </h3>
        </Link>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`whitespace-nowrap rounded-full ${bg} px-2.5 py-0.5 text-xs ${text}`}
          >
            {status}
          </span>
          {isUser ? (
            <div onClick={() => onEdit()} className="cursor-pointer">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="20px"
                width="20px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="Edit">
                  <g>
                    <path d="M3.548,20.938h16.9a.5.5,0,0,0,0-1H3.548a.5.5,0,0,0,0,1Z"></path>
                    <path d="M9.71,17.18a2.587,2.587,0,0,0,1.12-.65l9.54-9.54a1.75,1.75,0,0,0,0-2.47l-.94-.93a1.788,1.788,0,0,0-2.47,0L7.42,13.12a2.473,2.473,0,0,0-.64,1.12L6.04,17a.737.737,0,0,0,.19.72.767.767,0,0,0,.53.22Zm.41-1.36a1.468,1.468,0,0,1-.67.39l-.97.26-1-1,.26-.97a1.521,1.521,0,0,1,.39-.67l.38-.37,1.99,1.99Zm1.09-1.08L9.22,12.75l6.73-6.73,1.99,1.99Zm8.45-8.45L18.65,7.3,16.66,5.31l1.01-1.02a.748.748,0,0,1,1.06,0l.93.94A.754.754,0,0,1,19.66,6.29Z"></path>
                  </g>
                </g>
              </svg>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
