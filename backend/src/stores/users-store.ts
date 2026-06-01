import { UserModel, IUser } from "../models/user.model";

export type User = {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithPassword = User & { password: string };

function toUser(doc: IUser): User {
  return {
    _id: String(doc._id),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toUserWithPassword(doc: IUser): UserWithPassword {
  return { ...toUser(doc), password: doc.password };
}

function isCastError(error: unknown): boolean {
  return (error as { name?: string })?.name === "CastError";
}

export async function findByEmail(email: string): Promise<User | null>;
export async function findByEmail(
  email: string,
  opts: { withPassword: true }
): Promise<UserWithPassword | null>;
export async function findByEmail(
  email: string,
  opts?: { withPassword?: boolean }
): Promise<User | UserWithPassword | null> {
  const query = UserModel.findOne({ email });
  if (opts?.withPassword) query.select("+password");
  const doc = await query;
  if (!doc) return null;
  return opts?.withPassword ? toUserWithPassword(doc) : toUser(doc);
}

export async function findById(id: string): Promise<User | null> {
  try {
    const doc = await UserModel.findById(id);
    return doc ? toUser(doc) : null;
  } catch (error) {
    if (isCastError(error)) return null;
    throw error;
  }
}

export async function create(input: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const doc = await UserModel.create(input);
  return toUser(doc);
}
