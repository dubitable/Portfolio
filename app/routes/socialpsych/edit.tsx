import { Link, redirect, useSubmit } from "react-router";
import type { Route } from "./+types/edit";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { addLink, deleteLink, getLinks } from "~/.server/links";

export const loader = async ({}: Route.LoaderArgs) => {
  const links = await getLinks();
  return links;
};

export const meta = ({}: Route.MetaArgs) => {
  return [{ title: "Home | Pierre Quereuil" }];
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const link = formData.get("link");
  const del = formData.get("delete");

  if (!link) return;

  if (del && del == "true") {
    await deleteLink(link as string);
  } else {
    await addLink(link as string);
  }

  const links = await getLinks();
  return links;
};

const Edit = ({ loaderData }: Route.ComponentProps) => {
  const submit = useSubmit();

  return (
    <form
      className="flex flex-col items-center h-screen w-full mt-10 gap-10"
      method="post"
    >
      {loaderData.map(({ link, id }, index) => (
        <div
          className="w-1/2 flex justify-center gap-4 items-center"
          key={index}
        >
          <a
            href={link}
            target="_blank"
            className="mt-0.5 w-full rounded border-gray-500 shadow-lg sm:text-sm px-2 py-1"
          >
            {link}
          </a>

          <button
            className="size-5 cursor-pointer"
            type="button"
            onClick={() => {
              const formData = new FormData();
              formData.append("link", id);
              formData.append("delete", "true");

              submit(formData, { method: "post" });
            }}
          >
            <svg
              stroke="red"
              fill="red"
              stroke-width="0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
            </svg>
          </button>
        </div>
      ))}

      <div className="w-1/2 flex justify-center gap-4 items-center">
        <input
          type="link"
          id="Link"
          name="link"
          className="mt-0.5 w-full rounded border-gray-500 shadow-lg sm:text-sm px-2 py-1"
        />
        <button type="submit" className="size-5 cursor-pointer">
          <svg
            stroke="green"
            fill="green"
            strokeWidth="0"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm90.5 224H272v74.5c0 8.8-7.2 16-16 16-4.4 0-8.4-1.8-11.3-4.7-2.9-2.9-4.7-6.9-4.7-11.3V272h-74.5c-4.4 0-8.4-1.8-11.3-4.7-2.9-2.9-4.7-6.9-4.7-11.3 0-8.8 7.2-16 16-16H240v-74.5c0-8.8 7.2-16 16-16s16 7.2 16 16V240h74.5c8.8 0 16 7.2 16 16s-7.2 16-16 16z"></path>
          </svg>
        </button>
      </div>
      <Link to="/socialpsych" target="_blank">
        Try It Out!
      </Link>
    </form>
  );
};

export default Edit;
