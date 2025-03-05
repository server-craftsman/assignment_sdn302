import session from "express-session";
import { UserRole } from "../../core/enums";

declare module "express-session" {
  interface SessionData {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
}
