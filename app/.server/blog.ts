import { Blog } from "@prisma-app/client";
import prisma from "./prisma";

export const saveBlog = async (
  contentMD: string,
  userId: string,
  blogId?: string
): Promise<BlogVersion | null> => {
  const version = await prisma.version.create({ data: { contentMD } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) return null;

  let blog: Blog;

  if (blogId) {
    const result = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!result) return null;

    const data = { current: { connect: version } };

    blog = await prisma.blog.update({ where: { id: result.id }, data });

    await prisma.version.delete({ where: { id: result.versionId } });
  } else {
    const data = {
      current: { connect: version },
      user: { connect: user },
      username: user.username,
    };

    blog = await prisma.blog.create({ data });
  }

  return {
    id: blog.id,
    versionId: version.id,
    createdAt: version.createdAt,
    contentMD,
    published: blog.published,
    updatedAt: blog.updatedAt,
    userId,
    username: user.username,
  };
};

export const publishBlog = async (
  contentMD: string,
  userId: string,
  blogId?: string
): Promise<BlogVersion | null> => {
  const savedBlog = await saveBlog(contentMD, userId, blogId);

  if (!savedBlog) return null;

  const { id, updatedAt, username } = await prisma.blog.update({
    where: { id: savedBlog.id },
    data: { published: true },
  });

  return {
    id,
    userId,
    contentMD,
    updatedAt,
    versionId: savedBlog.versionId,
    createdAt: savedBlog.createdAt,
    published: true,
    username,
  };
};

export type BlogVersion = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  versionId: string;
  userId: string;
  contentMD: string;
  username: string;
};

export const getBlogs = async (userId?: string): Promise<BlogVersion[]> => {
  const OR: { published?: boolean; userId?: string }[] = [{ published: true }];
  if (userId) OR.push({ userId });

  const blogs = await prisma.blog.findMany({
    where: { OR },
    orderBy: { createdAt: "asc" },
  });

  const blogVersions = blogs.map(async (blog) => {
    return {
      ...(await prisma.version.findUniqueOrThrow({
        where: { id: blog.versionId },
      })),
      ...blog,
    };
  });

  return Promise.all(blogVersions);
};

export const getBlog = async (id: string): Promise<BlogVersion | null> => {
  const blog = await prisma.blog
    .findUnique({ where: { id } })
    .catch(() => null);

  if (!blog) return null;

  return {
    ...(await prisma.version.findUniqueOrThrow({
      where: { id: blog?.versionId },
    })),
    ...blog,
  };
};

export const deleteBlog = async (id: string) => {
  const deleted = await prisma.blog
    .delete({ where: { id } })
    .catch(() => undefined);

  return deleted;
};
