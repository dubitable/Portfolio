import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const maxAge = 12 * 60 * 60;

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge,
      path: "/",
      secure: true,
      secrets: ["secret"],
    },
  });

export { getSession, commitSession, destroySession };
