import { NextFunction, Request, Response } from "express";
import { logger } from "../utils";
import session from "express-session";
import { access } from "fs";

export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.session.user) {
      res.locals.session = { user: null };
      return next();
    }
    // Set session data for templates
    res.locals.session = {
      user: {
        id: req.session.user.id,
        name: req.session.user.name,
        email: req.session.user.email,
        role: req.session.user.role,
        access_token: req.session.user.access_token,
        refresh_token: req.session.user.refresh_token,
      },
    };

    next();
  } catch (error) {
    logger.error(`[Template Middleware Error] ${error}`);
    res.locals.session = { user: null };

    // Clear session on error
    req.session.destroy((err) => {
      if (err) {
        logger.error(`[Session Destroy Error] ${err}`);
      }
    });
    next();
  }
};
