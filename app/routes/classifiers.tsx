import { json, LoaderFunctionArgs, TypedResponse } from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";
import { getUserInfo } from "~/.server/auth";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { getSession } from "~/helpers/sessions";
import { Client, FileData, handle_file } from "@gradio/client";
import { z } from "zod";
import { CSSProperties, useState } from "react";
import ImageIcon from "~/components/icons/ImageIcon";
import mj from "/assets/mj.jpg";
import biles from "/assets/biles.webp";
import loading from "/assets/loading.gif";
import { Command } from "node_modules/@gradio/client/dist/types";
import FancyButton from "~/components/FancyButton";
import Progress from "~/components/Progress";
import BasketballIcon from "~/components/icons/BasketballIcon";
import FruitIcon from "~/components/icons/FruitIcon";
import { capitalize } from "~/helpers/string";
import HumanIcon from "~/components/icons/HumanIcon";

export type Classifier = {
  name: string;
  icon: () => JSX.Element;
  desc: string;
  longDesc: string;
  endpoint: Endpoint;
  image: string;
};

const classifiers = [
  {
    name: "basketball",
    icon: () => <BasketballIcon />,
    desc: "Balls and rims and players, oh my!",
    longDesc:
      "Have you ever wondered where the ball was when you were playing basketball? The rim? Yourself? This basketball classifier model will determine these with state-of-the-art accuracy so you don't have to.",
    endpoint: "basketball-classify",
    image: mj,
  },
  {
    name: "pose",
    icon: () => <HumanIcon />,
    desc: "Limbs in all the right places.",
    longDesc:
      "Limbs are pretty useful. Let you walk around. Pick stuff up. Do jumping jacks. Might as well be better at knowing where they are. This segmentation model will draw out the stick figure that lives in your body. Disclaimer: sometimes there are imperfections when Simone Biles is doing something crazy.",
    endpoint: "human-pose",
    image: biles,
  },
] as Classifier[];

type LoaderData = {
  ENV: { HUGGING_FACE_KEY: string };
  loggedIn: boolean;
  username?: string;
  userId?: string;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderData>> => {
  const session = await getSession(request.headers.get("Cookie"));

  const ENV = { HUGGING_FACE_KEY: process.env.HUGGING_FACE_KEY ?? "" };

  const userId = session.get("userId");

  if (!userId) return json({ loggedIn: false, ENV });

  const username = await getUserInfo(userId);

  return json({ loggedIn: true, userId, username, ENV });
};

const predictionSchema = z.object({
  data: z.array(z.object({ url: z.string() })),
  endpoint: z.string(),
  fn_index: z.number(),
  time: z.date(),
});

type Endpoint = "basketball-classify" | "human-pose";

const predict = async (
  file: Blob | FileData | Command,
  endpoint: Endpoint,
  HUGGING_FACE_KEY: string
) => {
  const app = await Client.connect("pierrequereuil/" + endpoint, {
    hf_token: `hf_${HUGGING_FACE_KEY}`,
  });

  const prediction = await app.predict("/predict", {
    image: file,
  });

  const { success, data } = predictionSchema.safeParse(prediction);

  return success ? data.data[0].url : undefined;
};

const submit = async (
  endpoint: Endpoint,
  file: Blob | FileData | Command,
  KEY: string,
  setImageUrl: (url?: string) => void,
  setLoading: (val: boolean) => void
) => {
  if (setLoading) setLoading(true);
  let imageUrl = undefined;

  imageUrl = await predict(file, endpoint, KEY);

  setImageUrl(imageUrl);
  if (setLoading) setLoading(false);
};

const Input = ({
  KEY,
  setImageUrl,
  hidden,
  endpoint,
}: {
  KEY: string;
  setImageUrl: (url?: string) => void;
  hidden?: boolean;
  endpoint: Endpoint;
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

          submit(endpoint, handle_file(files[0]), KEY, setImageUrl, setLoading);
        }}
      />
    </div>
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
    <section className="overflow-hidden bg-gray-50 sm:grid sm:grid-cols-2 m-5 rounded-xl">
      <div className="p-8 md:p-12 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            {capitalize(classifier.name)} Classifier
          </h2>

          <p className="hidden text-gray-500 md:mt8 md:block">
            {classifier.longDesc ?? classifier.desc}
          </p>

          <div className="my-4 md:my-8">
            <Input
              setImageUrl={setImageUrl}
              KEY={HUGGING_FACE_KEY}
              hidden={true}
              endpoint={classifier.endpoint}
            />
          </div>

          <div className="my-4 md:my-8">
            <a
              href="https://huggingface.co/spaces/pierrequereuil/basketball-classify"
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

  return (
    <div className="h-screen bg-white flex flex-col justify-between align-items">
      <Header username={loaderData.username} />
      <Progress
        classifiers={classifiers}
        current={current}
        setCurrent={setCurrent}
      />
      <Classifier
        HUGGING_FACE_KEY={loaderData.ENV.HUGGING_FACE_KEY}
        classifier={
          classifiers.find((classifier) => classifier.name === current) ??
          defaultClassifier
        }
      />
      <Footer />
    </div>
  );
};

export default Index;
