import fetcher from "exemples/instance";

export async function getPostsAction() {
  const data = await fetcher.get("/posts");
  return data;
}
