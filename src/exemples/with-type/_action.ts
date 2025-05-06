import fetcher from "exemples/instance";

export async function getToDoActions() {
  const data = await fetcher.post<ToDo>("/todos/1");
  return data;
}

type ToDo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};
