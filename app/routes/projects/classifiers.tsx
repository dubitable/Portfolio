import {
  MetaFunction,
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
} from "react-router";
import { CSSProperties, FormEvent, JSX, useEffect, useState } from "react";

import { z } from "zod";

import { getUserInfo } from "~/.server/auth";
import { getImageUrl } from "~/.server/image";
import { getSession } from "~/lib/sessions";
import { Client, FileData } from "@gradio/client";
import { Command } from "node_modules/@gradio/client/dist/types";

// components
import FancyButton from "~/components/FancyButton";
import Progress from "~/components/Progress";
import Select from "~/components/Select";
import { icons } from "~/components/icons/icon";

// icons
import HumanIcon from "~/components/icons/HumanIcon";
import BasketballIcon from "~/components/icons/BasketballIcon";
import ImageIcon from "~/components/icons/ImageIcon";

// images
import mj from "/assets/mj.jpg";
import biles from "/assets/biles.webp";
import loading from "/assets/loading.gif";
import { Route } from "./+types/classifiers";

export const meta: MetaFunction = () => {
  return [{ title: "Classifiers | Pierre Quereuil" }];
};

export type Classifier = {
  slug: string;
  name: string;
  icon: () => JSX.Element;
  desc: string;
  longDesc: string;
  space: Space;
  image: string;
  endpoint?: string;
};

const toBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject();
  });

const classifiers = [
  {
    slug: "basketball",
    name: "Basketball Classification",
    icon: () => <BasketballIcon />,
    desc: "Balls and rims and players, oh my!",
    longDesc:
      "Have you ever wondered where the ball was when you were playing basketball? The rim? Yourself? This basketball classifier model will determine these with state-of-the-art accuracy so you don't have to. Also MJ > Bron.",
    space: "pierrequereuil/basketball-classify",
    image: mj,
  },
  {
    slug: "pose",
    name: "Pose Segmentation",
    icon: () => <HumanIcon />,
    desc: "Limbs in all the right places.",
    longDesc:
      "Limbs are pretty useful. Let you walk around. Pick stuff up. Do jumping jacks. Might as well be better at knowing where they are. This segmentation model will draw out the stick figure that lives in your body. Disclaimer: sometimes there are imperfections when Simone Biles is doing something crazy.",
    space: "pierrequereuil/human-pose",
    image: biles,
  },
] as Classifier[];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  const ENV = { HUGGING_FACE_KEY: process.env.HUGGING_FACE_KEY ?? "" };

  const userId = session.get("userId");

  if (!userId) return { loggedIn: false, ENV };

  const username = await getUserInfo(userId);

  return { loggedIn: true, userId, username, ENV };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();

  if (formData.get("action") == "reset") {
    return {};
  }

  if (formData.get("action") == "uploadImage") {
    const url = await getImageUrl(formData);
    return { imageUrl: url };
  }

  return {
    classifier: {
      name: formData.get("name") as string,
      desc: formData.get("desc") as string,
      longdesc: formData.get("longdesc") as string,
      space: formData.get("space") as string,
      endpoint: formData.get("endpoint") as string,
      image: (formData.get("imageUrl") ?? "") as string,
      icon: formData.get("Icon") as string,
    },
  };
};

const predictionSchema = z.object({
  data: z.array(z.object({ url: z.string() })),
  endpoint: z.string(),
  fn_index: z.number(),
  time: z.date(),
});

type Space = string;

const predict = async (
  file: Blob | FileData | Command,
  HUGGING_FACE_KEY: string,
  space: Space,
  endpoint?: string
) => {
  const app = await Client.connect(space, {
    hf_token: `hf_${HUGGING_FACE_KEY}`,
  });

  const prediction = await app.predict(endpoint ?? "/predict", {
    image: file,
  });

  const { success, data } = predictionSchema.safeParse(prediction);

  return success ? data.data[0].url : undefined;
};

const Input = ({
  KEY,
  setImageUrl,
  hidden,
  space,
  endpoint,
}: {
  KEY: string;
  setImageUrl: (url?: string) => void;
  hidden?: boolean;
  space: Space;
  endpoint?: string;
}) => {
  const [isLoading, setLoading] = useState(false);
  hidden = hidden || false;

  const style = hidden
    ? ({ opacity: 0, position: "absolute", zIndex: -1 } as CSSProperties)
    : undefined;

  return (
    <div className="flex justify-center">
      {hidden ? (
        <label htmlFor="file" className="cursor-pointer">
          {isLoading ? (
            <img className="h-5 w-5 object-fill" src={loading}></img>
          ) : (
            <div className="flex justify-center align-middle gap-5">
              <div className="flex flex-col justify-center text-gray-900">
                Upload image
              </div>
              <ImageIcon size={25} />
            </div>
          )}
        </label>
      ) : null}

      <input
        type="file"
        id="file"
        name="file"
        style={style}
        accept={"image/*"}
        onChange={async (e) => {
          const files = e.target.files;
          if (!files?.length) return;

          if (setLoading) setLoading(true);
          let imageUrl = undefined;

          imageUrl = await predict(files[0], KEY, space, endpoint);

          setImageUrl(imageUrl);
          if (setLoading) setLoading(false);
        }}
      />
    </div>
  );
};

const defaultIcon = "Basketball";

const CustomClassifier = ({
  addClassifier,
  customNum,
}: {
  addClassifier: (classifier: Classifier) => void;
  customNum: number;
}) => {
  const [icon, setIcon] = useState<keyof typeof icons>(defaultIcon);

  const actionData = useActionData<typeof action>();

  const submit = useSubmit();

  useEffect(() => {
    if (actionData?.classifier) {
      const { name, desc, longdesc, icon, endpoint, space, image } =
        actionData.classifier;

      const elems = { name, desc, image, space, endpoint };

      addClassifier({
        ...elems,
        longDesc: longdesc,
        icon: icons[icon as keyof typeof icons],
        slug: `custom-${customNum}`,
      });

      const data = new FormData();
      data.append("action", "reset");
      submit(data, { method: "POST" });
    }
  }, [actionData]);

  const uploadImage = async (event: FormEvent<HTMLInputElement>) => {
    const data = new FormData();
    const files = event.currentTarget.files;

    if (!files || files.length == 0) return;

    const b64 = await toBase64(files[0]);
    if (!b64) return;

    const image = b64.toString().replace(/data:image\/(.+?);base64,/, "");

    data.append("image", image);
    data.append("action", "uploadImage");

    submit(data, { method: "POST" });
  };

  return (
    <Form method="POST">
      <section className="overflow-hidden bg-gray-50 sm:grid sm:grid-cols-2 m-5 rounded-xl">
        <div className="p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
            <div className="flex justify-center items-center gap-5 md:my-3">
              <div>
                <label
                  htmlFor="name"
                  className="block text-center align-middle text-xs font-medium text-gray-700"
                >
                  Name
                </label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  size={30}
                  defaultValue="Facebook Segmentation"
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                />
              </div>
              <div className="">
                <label
                  htmlFor="desc"
                  className="block text-xs font-medium text-gray-700"
                >
                  Short Description
                </label>

                <input
                  type="text"
                  id="desc"
                  name="desc"
                  size={40}
                  defaultValue="Facebook's body part segmentation model."
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-center items-center gap-5 md:my-3">
              <div>
                <label
                  htmlFor="longdesc"
                  className="block text-xs font-medium text-gray-700"
                >
                  Long Description
                </label>

                <input
                  type="text"
                  id="longdesc"
                  name="longdesc"
                  defaultValue="From their site: Meta presents Sapiens, foundation models for human tasks pretrained on 300 million human images. This demo showcases the finetuned segmentation model."
                  size={80}
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-center items-center gap-5 md:my-3">
              <div className="w-2/3">
                <label
                  htmlFor="space"
                  className="block text-xs font-medium text-gray-700"
                >
                  Hugging Face Space
                </label>

                <input
                  type="text"
                  id="space"
                  name="space"
                  defaultValue="facebook/sapiens_seg"
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                />
              </div>

              <div className="w-1/3">
                <label
                  htmlFor="endpoint"
                  className="block text-xs font-medium text-gray-700"
                >
                  Endpoint
                </label>

                <input
                  type="text"
                  id="endpoint"
                  name="endpoint"
                  defaultValue="/process_image"
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-center items-center align-middle md:mt-6 gap-5">
              <label htmlFor={"Icon"} className="block text-sm text-gray-900">
                Icon
              </label>
              <Select
                title="Icon"
                options={Object.keys(icons) as (keyof typeof icons)[]}
                onSelect={(value) => setIcon(value)}
                defaultValue={defaultIcon}
                disableIcon
              />
              <div className="size-6">{icons[icon]()}</div>
            </div>
            <div className="flex justify-center items-center align-middle md:mt-6 gap-5">
              <FancyButton title="Create!" type="submit" />
            </div>
          </div>
        </div>

        {actionData?.imageUrl ? (
          <div className="overflow-hidden">
            <input
              className="hidden -z-0 "
              name="imageUrl"
              value={actionData.imageUrl}
              onChange={() => {}}
            />
            <img
              alt=""
              src={actionData.imageUrl}
              className="h-56 w-full object-cover sm:h-full overflow-hidden"
            />
          </div>
        ) : (
          <div className="h-56 w-full sm:h-full gap-4">
            <label htmlFor="image">
              <div className="flex flex-col w-full h-full justify-center align-middle items-center gap-4">
                Upload your image here: <ImageIcon size={50} />
              </div>
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="hidden -z-10"
              onChange={uploadImage}
            />
          </div>
        )}
      </section>
    </Form>
  );
};

const Classifier = ({
  HUGGING_FACE_KEY,
  classifier,
}: {
  HUGGING_FACE_KEY: string;
  classifier: Classifier;
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  return (
    <section className="overflow-scroll bg-gray-50 sm:grid sm:grid-cols-2 m-5 rounded-xl">
      <div className="p-8 md:p-12 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {classifier.name}
          </h2>

          <p className="hidden text-gray-500 md:mt8 md:block">
            {classifier.longDesc ?? classifier.desc}
          </p>

          <div className="my-4 md:my-8">
            <Input
              setImageUrl={setImageUrl}
              KEY={HUGGING_FACE_KEY}
              hidden={true}
              space={classifier.space}
              endpoint={classifier.endpoint}
            />
          </div>

          <div className="my-4 md:my-8">
            <a
              href={"https://huggingface.co/spaces/" + classifier.space}
              target="_blank"
            >
              <FancyButton title="Go to HuggingFace Space" />
            </a>
          </div>
        </div>

        <p className="hidden text-gray-500 md:mt8 md:block">
          Note: the space resources may sleep if not accessed for a certain
          period of time, bear with the loading screen for a little bit...
        </p>
      </div>

      <img
        alt=""
        src={imageUrl ?? classifier.image}
        className="h-56 w-full object-cover sm:h-full"
      />
    </section>
  );
};

const defaultClassifier = classifiers[0];

const Index = () => {
  const loaderData = useLoaderData<typeof loader>();
  const [current, setCurrent] = useState(defaultClassifier.name);
  const [elements, setElements] = useState(classifiers);

  return (
    <div className="h-full bg-white">
      <Progress
        classifiers={elements}
        current={current}
        setCurrent={setCurrent}
      />
      {current == "custom" ? (
        <CustomClassifier
          addClassifier={(classifier) => setElements([...elements, classifier])}
          customNum={elements.length - classifiers.length}
        />
      ) : (
        <Classifier
          HUGGING_FACE_KEY={loaderData.ENV.HUGGING_FACE_KEY}
          classifier={
            elements.find((classifier) => classifier.name === current) ??
            defaultClassifier
          }
        />
      )}
    </div>
  );
};

export default Index;
