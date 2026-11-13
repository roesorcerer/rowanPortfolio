import { AdminModel, IAdmin } from "../models/admin.model";

export type Admin = {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminWithPassword = Admin & { password: string };

function toAdmin(doc: IAdmin): Admin {
  return {
    _id: String(doc._id),
    email: doc.email,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toAdminWithPassword(doc: IAdmin): AdminWithPassword {
  return { ...toAdmin(doc), password: doc.password };
}

function isCastError(error: unknown): boolean {
  return (error as { name?: string })?.name === "CastError";
}

export async function findByEmail(email: string): Promise<Admin | null>;
export async function findByEmail(
  email: string,
  opts: { withPassword: true }
): Promise<AdminWithPassword | null>;
export async function findByEmail(
  email: string,
  opts?: { withPassword?: boolean }
): Promise<Admin | AdminWithPassword | null> {
  const query = AdminModel.findOne({ email });
  if (opts?.withPassword) query.select("+password");
  const doc = await query;
  if (!doc) return null;
  return opts?.withPassword ? toAdminWithPassword(doc) : toAdmin(doc);
}

export async function findById(id: string): Promise<Admin | null> {
  try {
    const doc = await AdminModel.findById(id);
    return doc ? toAdmin(doc) : null;
  } catch (error) {
    if (isCastError(error)) return null;
    throw error;
  }
}

export async function create(input: {
  email: string;
  password: string;
  name: string;
}): Promise<Admin> {
  const doc = await AdminModel.create(input);
  return toAdmin(doc);
}
