import { json, LoaderFunctionArgs, TypedResponse } from "@vercel/remix";
import { useLoaderData, useLocation } from "@remix-run/react";
import ReactMarkdown from "~/components/Markdown";
import { BlogVersion, getBlog } from "~/.server/blog";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Error404 from "~/components/404";
import { getUserInfo } from "~/.server/auth";
import { getSession } from "~/helpers/sessions";
import { isSafari } from "react-device-detect";

type LoaderData = {
  success: boolean;
  loggedIn: boolean;
  username?: string;
  userId?: string;
  blog?: BlogVersion;
};

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderData>> => {
  if (params?.id == "temp") {
    return json({ success: true, loggedIn: false });
  }

  const session = await getSession(request.headers.get("Cookie"));

  const userId = session.get("userId");

  const blog = await getBlog(params?.id ?? "");

  if (!blog || !blog.published) {
    return json({
      success: false,
      loggedIn: Boolean(userId),
      userId,
      username: userId ? await getUserInfo(userId) : undefined,
    });
  }

  return json({
    success: true,
    blog,
    loggedIn: Boolean(userId),
    userId,
    username: userId ? await getUserInfo(userId) : undefined,
  });
};

const BlogViewer = () => {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();

  let blog = loaderData?.blog;

  if (loaderData?.success && !loaderData.blog) {
    blog = location.state?.tempBlog;
  }

  if (!blog) {
    return <Error404 />;
  }

  if (isSafari) {
    return (
      <div className="m-2">
        <h2 className="text-lg font-bold">
          Looks like Safari is bugging out with Markdown for some reason. The
          following will be the raw md file so not super pretty, but hopefully
          better than nothing.
        </h2>
        <div>{blog?.contentMD}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col justify-between">
      <Header username={loaderData.username} />
      <div className="flex justify-center align-middle mx-10 mt-10">
        <ReactMarkdown>{blog.contentMD}</ReactMarkdown>
      </div>
      <Footer />
    </div>
  );
};

export default BlogViewer;
