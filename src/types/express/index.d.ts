// import { UserRole } from "./auth.interface";

declare namespace Express {
  interface Request {
    user: {
      id: string;
      role: UserRole;
      version: number;
    };
  }
}
