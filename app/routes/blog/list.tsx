import { redirectDocument } from "react-router";
import { Form, useActionData, useLoaderData, useSubmit } from "react-router";
import { FormEvent, useEffect, useRef, useState } from "react";

import { z } from "zod";
import {
  BlogVersion,
  deleteBlog,
  getBlogs,
  publishBlog,
  saveBlog,
} from "~/.server/blog";
import { getUserInfo } from "~/.server/auth";
import { getSession } from "~/lib/sessions";
import { Route } from "./+types/list";

// components
import FancyButton from "~/components/general/FancyButton";
import Footer from "~/components/general/Footer";
import Header from "~/components/general/Header";
import ReactMarkdown from "~/components/blog/Markdown";
import BlogCard from "~/components/blog/BlogCard";

// icons
import ImageIcon from "~/components/icons/ImageIcon";

export const meta = ({}: Route.LoaderArgs) => {
  return [{ title: "Blogs | Pierre Quereuil" }];
};

const formatDate = (date: string) =>
  new Date(date).toISOString().replace(/T/, " ").replace(/\..+/, "");

const toBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject();
  });

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  const blogs = await getBlogs(userId);

  if (!userId) return { success: false, blogs };

  const username = await getUserInfo(userId);

  return { success: true, user: { id: userId, username }, blogs };
};

const BlogPost = z.object({
  contentMD: z.string(),
  action: z.enum(["save", "publish", "image", "delete"]),
  blogId: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  const formData = await request.formData();

  if (formData.get("action") == "image") {
    const key = process.env.IMAGE_BB_KEY;
    if (!key) return { success: false, error: "key" };

    const result = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: "POST",
      body: formData,
    });

    if (result.status != 200) return { success: false, error: "api" };

    const { data } = await result.json();

    return { success: true, url: data.url as string };
  }

  if (!userId) return { success: false, error: "user" };

  const blog = {
    contentMD: formData.get("contentMD"),
    action: formData.get("action"),
    blogId: formData.get("blogId"),
  };

  const { error, data } = BlogPost.safeParse(blog);
  if (error) return { success: false, error: "parse" };

  const { action, contentMD, blogId } = data;
  const bid = blogId == "" ? undefined : blogId;

  if (action == "save") {
    if (bid) return { success: false, error: "exists" };

    const savedBlog = await saveBlog(contentMD, userId);

    if (!savedBlog) return { success: false, error: "blog" };

    return {
      success: true,
      blogId: savedBlog.id,
      lastSaved: savedBlog.createdAt,
    };
  }

  if (action == "publish") {
    const publishedBlog = await publishBlog(contentMD, userId, bid);
    if (!publishedBlog) return { success: false, error: "publish" };

    return {
      success: true,
      blogId: publishedBlog.id,
      lastSaved: publishedBlog.createdAt,
      lastPublished: publishedBlog.updatedAt,
    };
  }

  if (action == "delete") {
    if (bid) {
      const deletedBlog = await deleteBlog(bid);
      if (deletedBlog) {
        return redirectDocument("/blog");
      }
    }
  }

  return { success: false, error: "action" };
};

const Blogs = ({
  toggleWrite,
  user,
  toggleBadges,
  tempBlog,
}: {
  toggleWrite: (blog?: BlogVersion, create?: boolean) => void;
  user?: { id: string; username: string };
  toggleBadges: () => void;
  tempBlog?: BlogVersion;
}) => {
  const loaderData = useLoaderData<typeof loader>();
  const blogs = loaderData.blogs.reverse();

  const allBlogs = tempBlog ? [tempBlog, ...blogs] : blogs;

  toggleBadges();

  return (
    <div className="flex flex-col justify-center align-middle w-full">
      <div className="flex justify-center my-10">
        <FancyButton title="Create New Blog" onClick={() => toggleWrite()} />
      </div>
      <div className="flex flex-col justify-center align-middle gap-5 ">
        {allBlogs.map(
          (
            {
              contentMD,
              id,
              createdAt,
              published,
              userId,
              updatedAt,
              versionId,
              username,
            },
            index
          ) => {
            const title = contentMD.match(/# (?<title>.+?)\n/)?.groups?.title;

            let status = username;

            if (userId == user?.id) {
              status = published ? "published" : "saved";
            }

            if (id == "temp") {
              status = "temp";
            }

            return (
              <div className="flex justify-center align-middle" key={id}>
                <BlogCard
                  title={title}
                  createdAt={new Date(createdAt)}
                  index={index}
                  id={id}
                  status={status}
                  tempBlog={id == "temp" ? tempBlog : undefined}
                  onEdit={() =>
                    toggleWrite({
                      contentMD,
                      id,
                      published,
                      createdAt: new Date(createdAt),
                      updatedAt: new Date(updatedAt),
                      userId,
                      versionId,
                      username,
                    })
                  }
                />
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

const placeholderText = `# Here is a Title
Here is some **bold** text. Here is some *italic* text. Here is some ~strikethrough~ text. Here is a code block:

~~~ts
const [message, setMessage] = useState("Hello World");
~~~

For more information, consider the [Markdown Guide](https://www.markdownguide.org).`;

const BlogWrite = ({
  toggleWrite,
  blogVersion,
  showBadges,
  toggleBadges,
  loggedIn,
  setTempBlog,
}: {
  toggleWrite: () => void;
  blogVersion?: BlogVersion;
  showBadges: boolean;
  toggleBadges: () => void;
  loggedIn: boolean;
  tempBlog?: BlogVersion;
  setTempBlog: (blog?: BlogVersion) => void;
}) => {
  const actionData = useActionData<typeof action>();
  const [count, setCount] = useState(0);
  const [tempPublished, setTempPublished] = useState<Date | undefined>();

  const submit = useSubmit();

  const [images, setImages] = useState<string[]>([]);

  const [contentMD, setContentMD] = useState(
    blogVersion?.contentMD ?? placeholderText
  );

  if (actionData?.url && !images.includes(actionData?.url)) {
    setImages([...images, actionData?.url]);
    setContentMD(contentMD + "\n" + `![alt text](${actionData?.url})`);
  }

  useEffect(() => {
    if (count == 1 && !showBadges) toggleBadges();
    setCount(count + 1);
  }, [actionData]);

  const uploadImage = async (event: FormEvent<HTMLInputElement>) => {
    const data = new FormData();
    const files = event.currentTarget.files;

    if (!files || files.length == 0) return;

    const b64 = await toBase64(files[0]);
    if (!b64) return;

    const image = b64.toString().replace(/data:image\/(.+?);base64,/, "");

    data.append("action", "image");
    data.append("image", image);

    submit(data, { method: "POST" });
  };

  const lastSaved = blogVersion?.createdAt ?? actionData?.lastSaved;
  const lastPublished =
    tempPublished ??
    (blogVersion?.published ? blogVersion?.updatedAt : null) ??
    actionData?.lastPublished;

  const blogId = blogVersion?.id ?? actionData?.blogId;

  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="w-full">
      <Form method="POST">
        <div className="flex w-full px-8 gap-10 m-y-30">
          <div className="w-1/2">
            <label
              htmlFor="markdown"
              className="block text-sm font-medium text-gray-700"
            >
              Markdown Editor
            </label>
            <textarea
              name="contentMD"
              onChange={(event) => setContentMD(event.target.value)}
              value={contentMD}
              id="markdown"
              rows={21}
              ref={ref}
              className="mt-2 w-full rounded-lg border-gray-200 align-top shadow-sm sm:text-sm resize-none text-black"
            />
          </div>
          <input
            name="blogId"
            value={blogId ? blogId : ""}
            readOnly
            style={{ opacity: 0, position: "absolute", zIndex: -1 }}
          />
          <div className="w-1/2 border-gray-200">
            <label
              htmlFor="rendered"
              className="block text-sm font-medium text-gray-700"
            >
              Result
            </label>
            <div
              id="rendered"
              className="mt-2 overflow-auto"
              style={{ height: ref?.current?.offsetHeight ?? undefined }}
            >
              <ReactMarkdown>{contentMD}</ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-4 my-5">
          <label htmlFor="image">
            <ImageIcon size={30} />
          </label>
          <input
            type="file"
            accept="image/*"
            id="image"
            name="image"
            onChange={uploadImage}
            style={{ opacity: 0, position: "absolute", zIndex: -1 }}
          />
        </div>
        <div className="flex flex-row justify-center gap-4 mt-5">
          <FancyButton title="Back to Blogs" onClick={toggleWrite} />
          <FancyButton title="Save" type="submit" />
          <FancyButton
            title="Publish"
            type="submit"
            onClick={() => {
              if (!loggedIn) {
                const now = new Date(Date.now());
                setTempBlog({
                  contentMD,
                  createdAt: now,
                  id: "temp",
                  published: true,
                  updatedAt: now,
                  userId: "",
                  username: "",
                  versionId: "",
                });
                setTempPublished(now);
              }
            }}
          />
          <FancyButton title="Delete" type="submit" />
        </div>
        <div className="flex flex-col justify-center align-middle gap-4 mt-5">
          {showBadges && lastSaved ? (
            <div className="flex justify-center">
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="-ms-1 me-1.5 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <p className="whitespace-nowrap text-sm">
                  Last Saved: {formatDate(lastSaved.toString())}
                </p>
              </span>
            </div>
          ) : null}
          {showBadges && lastPublished ? (
            <div className="flex justify-center">
              <span className="inline-flex items-center justify-center rounded-full bg-purple-100 px-2.5 py-0.5 text-purple-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="-ms-1 me-1.5 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <p className="whitespace-nowrap text-sm">
                  Last Published: {formatDate(lastPublished.toString())}
                </p>
              </span>
            </div>
          ) : null}
        </div>
      </Form>
    </div>
  );
};

const Blog = () => {
  const { user } = useLoaderData<typeof loader>();
  const [isWriting, setIsWriting] = useState(false);

  const [blog, setBlog] = useState<BlogVersion | undefined>();
  const [showBadges, setBadges] = useState(false);
  const [tempBlog, setTempBlog] = useState<BlogVersion | undefined>();

  const toggleWrite = (blog?: BlogVersion) => {
    if (blog) setBlog({ ...blog });
    else setBlog(undefined);

    setBadges(Boolean(blog));

    setIsWriting(!isWriting);
  };

  return (
    <div className="h-full bg-white flex flex-col justify-between">
      <Header username={user?.username} />
      {isWriting ? (
        <BlogWrite
          toggleWrite={toggleWrite}
          blogVersion={blog}
          showBadges={showBadges}
          toggleBadges={() => setBadges(true)}
          loggedIn={Boolean(user)}
          tempBlog={tempBlog}
          setTempBlog={setTempBlog}
        />
      ) : (
        <Blogs
          toggleWrite={toggleWrite}
          user={user}
          toggleBadges={() => setBadges(false)}
          tempBlog={tempBlog}
        />
      )}
      <Footer />
    </div>
  );
};

export default Blog;
