import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";
import { hashPassword, verifyPassword, signToken } from "../utils/auth.utils";
import { ApiResponse } from "../types";
import { RegisterInput, LoginInput } from "../validators/auth.validators";

// POST /api/auth/register
// Creates a new user account and returns a JWT.
export async function register(
  req: Request<unknown, unknown, RegisterInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, name } = req.body;

    // Check if a user with this email already exists.
    // We check explicitly rather than relying on the MongoDB unique
    // index error because the index error message is cryptic.
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: "Email already registered",
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      name,
    });

    const token = signToken({ userId: String(user._id), role: user.role });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: user.toJSON(), // toJSON strips password via the transform
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
// Verifies credentials and returns a JWT.
export async function login(
  req: Request<unknown, unknown, LoginInput>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    // .select("+password") overrides select: false on the schema
    // so we can verify the hash. Without this, password would be undefined.
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      // Use the same error message for "user not found" and "wrong password"
      // to prevent email enumeration attacks.
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    const isMatch = await verifyPassword(user.password, password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    const token = signToken({ userId: String(user._id), role: user.role });

    res.json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me
// Returns the currently authenticated user's profile.
// Requires requireAuth middleware to be applied on the route.
export async function getMe(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const user = await UserModel.findById(req.user!.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
