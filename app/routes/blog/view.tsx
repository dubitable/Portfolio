import { useLocation } from "react-router";

import { getBlog } from "~/.server/blog";
import { getUserInfo } from "~/.server/auth";
import { getSession } from "~/lib/sessions";

// components
import ReactMarkdown from "~/components/blog/Markdown";
import Header from "~/components/general/Header";
import Footer from "~/components/general/Footer";
import Error404 from "~/components/general/404";
import { Route } from "./+types/view";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  if (params?.id == "temp") {
    return { success: true, loggedIn: false };
  }

  const session = await getSession(request.headers.get("Cookie"));

  const userId = session.get("userId");

  const blog = await getBlog(params?.id ?? "");

  if (!blog || !blog.published) {
    return {
      success: false,
      loggedIn: Boolean(userId),
      userId,
      username: userId ? await getUserInfo(userId) : undefined,
    };
  }

  return {
    success: true,
    blog,
    loggedIn: Boolean(userId),
    userId,
    username: userId ? await getUserInfo(userId) : undefined,
  };
};

export const meta = ({}: Route.MetaFunction) => {
  return [{ title: "Blog | Pierre Quereuil" }];
};

const BlogViewer = ({ loaderData }: Route.ComponentProps) => {
  const location = useLocation();

  let blog = loaderData?.blog;

  if (loaderData?.success && !loaderData.blog) {
    blog = location.state?.tempBlog;
  }

  if (!blog) {
    return <Error404 />;
  }

  return (
    <div className="h-full bg-white flex flex-col justify-between">
      <Header username={loaderData.username} />
      <div className="flex justify-center align-middle mx-10 mt-10">
        <ReactMarkdown>{blog.contentMD}</ReactMarkdown>
      </div>
      <Footer />
    </div>
  );
};

export default BlogViewer;
