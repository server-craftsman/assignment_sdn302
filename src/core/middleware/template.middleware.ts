import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { DataStoredInToken } from "../../modules/auth";
import { UserSchema } from "../../modules/user";
import { logger } from "../utils";

export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      res.locals.user = null;
      return next();
    }

    // Verify and decode token
    const userToken = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET ?? ""
    ) as DataStoredInToken;

    // Check user and token version
    const user = await UserSchema.findOne({ _id: userToken.id }).lean();

    if (!user || String(user?.token_version) !== String(userToken.version)) {
      res.locals.user = null;
      // Clear invalid token
      res.clearCookie("access_token", { path: "/" });
      return next();
    }

    // Set user data for templates
    res.locals.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error(`[Template Middleware Error] ${error}`);
    res.locals.user = null;
    // Clear invalid token
    res.clearCookie("access_token", { path: "/" });
    next();
  }
};
