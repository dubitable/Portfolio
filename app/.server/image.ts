import notfound from "/assets/notfound.png";

export const getImageUrl = async (formData: FormData) => {
  const key = process.env.IMAGE_BB_KEY;

  const result = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: formData,
  }).catch(() => undefined);

  if (!result || result.status != 200) return notfound;

  const { data } = await result.json();
  return (data?.url as string | undefined) ?? notfound;
};
