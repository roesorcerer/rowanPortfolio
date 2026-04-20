// Shared types for the backend

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthUser {
  userId: string;
  role: string;
}

// Augment Express's Request type so TypeScript knows about req.user.
// This is the standard pattern for extending third-party types.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  link?: string;
  technologies: string[];
}
