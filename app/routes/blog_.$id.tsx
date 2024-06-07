import { json, LoaderFunctionArgs, TypedResponse } from "@vercel/remix";
import { useLoaderData, useLocation } from "@remix-run/react";
import ReactMarkdown from "~/components/Markdown";
import { BlogVersion, getBlog } from "~/.server/blog";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Error404 from "~/components/404";

type LoaderData = {
  success: boolean;
  blog?: BlogVersion;
};

export const loader = async ({
  params,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderData>> => {
  if (params?.id == "temp") {
    return json({ success: true });
  }

  const blog = await getBlog(params?.id ?? "");

  if (!blog || !blog.published) {
    return json({ success: false });
  }

  return json({ success: true, blog });
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

  return (
    <div className="h-screen bg-white flex flex-col justify-between">
      <Header />
      <div className="flex justify-center align-middle">
        <ReactMarkdown>{blog.contentMD}</ReactMarkdown>
      </div>
      <Footer />
    </div>
  );
};

export default BlogViewer;
