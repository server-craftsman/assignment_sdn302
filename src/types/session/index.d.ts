import { access } from "fs";
import session from "express-session";
import { UserRole } from "../../core/enums";

declare module "express-session" {
  interface SessionData {
    user: {
      id: string | undefined;
      name: string;
      email: string;
      role: UserRole;
      access_token?: string;
      // refresh_token: string;
    };
  }
}
