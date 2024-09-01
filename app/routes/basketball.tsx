import {
  json,
  LoaderFunctionArgs,
  redirect,
  TypedResponse,
} from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";
import { getUserInfo } from "~/.server/auth";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { getSession } from "~/helpers/sessions";
import { Client, handle_file } from "@gradio/client";
import { z } from "zod";
import { CSSProperties, useState } from "react";
import ImageIcon from "~/components/icons/ImageIcon";
import mj from "/assets/basketball.jpg";
import loading from "/assets/loading.gif";
import Select from "~/components/Select";
import VideoIcon from "~/components/icons/VideoIcon";
import FancyButton from "~/components/FancyButton";

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
  file: File | string,
  type: "video" | "image",
  endpoint: Endpoint,
  HUGGING_FACE_KEY: string
) => {
  const suffix = type == "video" ? "-video" : "";
  const app = await Client.connect("pierrequereuil/" + endpoint + suffix, {
    hf_token: `hf_${HUGGING_FACE_KEY}`,
  });

  const prediction = await app.predict("/predict", {
    image: handle_file(file),
  });

  console.log(prediction);

  const { success, data } = predictionSchema.safeParse(prediction);

  return success ? data.data[0].url : undefined;
};

type DetectionMode = "classify" | "pose" | "both";

const submit = async (
  detectionMode: DetectionMode,
  file: File | string,
  type: "image" | "video",
  KEY: string,
  setImageUrl: (url?: string) => void,
  setLoading: (val: boolean) => void
) => {
  if (setLoading) setLoading(true);
  let imageUrl = undefined;

  if (detectionMode == "classify") {
    imageUrl = await predict(file, type, "basketball-classify", KEY);
  }

  if (detectionMode == "pose") {
    imageUrl = await predict(file, type, "human-pose", KEY);
  }

  setImageUrl(imageUrl);
  if (setLoading) setLoading(false);
};

const examples = {
  Jordan: "https://i.ibb.co/XWxGXMz/Mike.webp",
  LeBron: "https://i.ibb.co/sK4dxVN/Bron.jpg",
};

const Input = ({
  KEY,
  setImageUrl,
  detectionMode,
  hidden,
  inputType,
  file,
}: {
  KEY: string;
  setImageUrl: (url?: string) => void;
  inputType: "image" | "video";
  detectionMode: DetectionMode;
  file: "upload" | "Jordan" | "LeBron";
  hidden?: boolean;
}) => {
  const [isLoading, setLoading] = useState(false);
  hidden = hidden || false;

  const style = hidden
    ? ({ opacity: 0, position: "absolute", zIndex: -1 } as CSSProperties)
    : undefined;

  if (inputType == "video") {
    const space =
      detectionMode == "classify"
        ? "basketball-classify-video"
        : "human-pose-video";

    return (
      <a
        href={"https://huggingface.co/spaces/pierrequereuil/" + space}
        target="_blank"
      >
        <FancyButton title="Go to HuggingFace Space" />
      </a>
    );
  }

  if (file != "upload") {
    return (
      <div className="flex justify-center align-middle gap-5">
        {isLoading ? (
          <img className="h-5 w-5 object-fill" src={loading}></img>
        ) : (
          <FancyButton
            title="Predict"
            onClick={() =>
              submit(
                detectionMode,
                examples[file],
                inputType,
                KEY,
                setImageUrl,
                setLoading
              )
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {hidden ? (
        <label htmlFor="file" className="cursor-pointer">
          {isLoading ? (
            <img className="h-5 w-5 object-fill" src={loading}></img>
          ) : inputType == "image" ? (
            <div className="flex justify-center align-middle gap-5">
              <div className="flex flex-col justify-center text-gray-900">
                Upload {inputType}
              </div>
              <ImageIcon size={25} />
            </div>
          ) : (
            <div className="flex justify-center align-middle gap-5">
              <div className="flex flex-col justify-center text-gray-900">
                Upload {inputType}
              </div>
              <VideoIcon size={25} />
            </div>
          )}
        </label>
      ) : null}

      <input
        type="file"
        id="file"
        name="file"
        style={style}
        accept={inputType + "/*"}
        onChange={async (e) => {
          const files = e.target.files;
          if (!files?.length) return;

          submit(
            detectionMode,
            files[0],
            inputType,
            KEY,
            setImageUrl,
            setLoading
          );
        }}
      />
    </div>
  );
};

const Index = () => {
  const user = useLoaderData<typeof loader>();

  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [detectionMode, setMode] = useState<DetectionMode>("classify");
  const [file, setFile] = useState<"upload" | "Jordan" | "LeBron">("upload");

  return (
    <div className="h-screen bg-white flex flex-col justify-between align-items">
      <Header username={user.username} />
      <section className="overflow-hidden bg-gray-50 sm:grid sm:grid-cols-2 m-5 rounded-xl">
        <div className="p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Basketball Classifier
            </h2>

            <p className="hidden text-gray-500 md:mt-4 md:block">
              Have you ever wondered where the ball was when you were playing
              basketball? The rim? Yourself? This basketball classifier model
              will determine these with state-of-the-art accuracy so you don't
              have to.
            </p>

            <div className="flex justify-center mt-4 md:mt-8 gap-8">
              <Select
                options={["image", "video"]}
                defaultValue="image"
                title="File Type"
                onSelect={setFileType}
              />
              <Select
                options={["classify", "pose"]}
                defaultValue="classify"
                title="Detection Mode"
                onSelect={setMode}
              />
              <Select
                options={["upload", "Jordan", "LeBron"]}
                defaultValue="classify"
                title="File"
                onSelect={setFile}
              />
            </div>

            <div className="mt-4 md:mt-8">
              <Input
                setImageUrl={setImageUrl}
                KEY={user.ENV.HUGGING_FACE_KEY}
                detectionMode={detectionMode}
                hidden={true}
                inputType={fileType}
                file={file}
              />
            </div>
          </div>
        </div>

        <img
          alt=""
          src={imageUrl ?? mj}
          className="h-56 w-full object-cover sm:h-full"
        />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
