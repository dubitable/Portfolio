import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const signup = async (userCreate: {
  username: string;
  password: string;
}) => {
  const { username, password } = userCreate;

  const hashed = await bcrypt.hash(password, await bcrypt.genSalt());

  await prisma.user.create({ data: { username, password: hashed } });
};

export const LoginErrors = ["user", "password", "parse"] as const;
export type LoginError = (typeof LoginErrors)[number];

export const login = async (userSearch: {
  username: string;
  password: string;
}): Promise<(string & {}) | LoginError> => {
  const { username, password } = userSearch;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) return "user";
  if (!bcrypt.compare(user.password, password)) return "password";

  return user.id;
};

export const GetUserErrors = ["user"] as const;
export type GetUserError = (typeof GetUserErrors)[number];

export const getUserInfo = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) return "user";

  return user.username;
};
