import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { login, LoginError, LoginErrors } from "~/.server/auth";
import { z } from "zod";
import { commitSession, getSession } from "~/sessions";
import Header from "~/components/Header";
import Footer from "~/components/Footer";

const User = z.object({
  username: z.string(),
  password: z.string(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (userId) return redirect("/");

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  const user = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const { error, data } = User.safeParse(user);
  if (error) return json({ success: false, error: "parse" });

  const userId = await login(data);

  if (LoginErrors.includes(userId as LoginError))
    return json({ success: false, error: userId });

  session.set("userId", userId);

  const headers = { "Set-Cookie": await commitSession(session) };

  return redirect("/", { headers });
};

const Login = () => {
  return (
    <div className="h-screen bg-white flex flex-col justify-between align-items">
      <Header />
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
            Welcome to the PierreFolio
          </h1>

          <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
            If you're trying to access the authenticated parts of this app, then
            you better be named Pierre Quereuil or otherwise be very good at
            guessing.
          </p>

          <Form
            method="POST"
            className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8"
          >
            <p className="text-center text-lg font-medium">
              Sign in to your account
            </p>

            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>

              <div className="relative">
                <input
                  type="username"
                  name="username"
                  id="username"
                  className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                  placeholder="Enter username"
                />

                <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>

              <div className="relative">
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                  placeholder="Enter password"
                />

                <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
            >
              Sign in
            </button>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
