import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils";
import { HttpStatus } from "../enums";
import { DataStoredInToken, TokenData } from "../../modules/auth";
import { UserRole, UserSchema } from "../../modules/user";

export const userMiddleware = (
  requiredRoles?: UserRole[],
  isClient = false
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let authHeader = req.headers["authorization"];
      if (!authHeader && req.session?.user?.access_token) {
        authHeader = `Bearer ${req.session?.user?.access_token}`;
      }

      if (isClient) {
        if (!authHeader) {
          req.user = { id: "", role: null, version: 0 };
          return next();
        }
      } else {
        if (!authHeader) {
          res
            .status(HttpStatus.NOT_FOUND)
            .json({ message: "No token, authorization denied." });
          return;
        }
        await handleCheckToken(req, res, next, authHeader, requiredRoles);
      }
    } catch (error) {
      logger.error(`[Template Middleware Error] ${error}`);
      res.locals.session = { user: null };
      next();
    }
  };
};

export const handleCheckToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
  authHeader: string | undefined,
  roles?: UserRole[]
): Promise<void> => {
  const userSchema = UserSchema;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    if (!token) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "No token, authorization denied." });
      return;
    }

    try {
      const userToken = jwt.verify(
        token,
        process.env.JWT_TOKEN_SECRET ?? ""
      ) as DataStoredInToken;

      // decode token
      const user = await userSchema.findOne({ _id: userToken.id }).lean();

      if (!user || String(user?.token_version) !== String(userToken.version)) {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: "Access denied: invalid token!" });
        return;
      }

      // set user data in both req and res.locals
      req.user = {
        id: userToken.id,
        role: userToken.role,
        version: userToken.version,
      };

      // res.locals.session = {
      //   ...res.locals,
      //   user: {
      //     id: user._id,
      //     name: user.name,
      //     email: user.email,
      //     role: user.role,
      //     access_token: token,
      //   },
      // };

      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        access_token: token,
      };

      if (roles && roles.length > 0 && !roles.includes(req.user.role)) {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: "Access denied: insufficient role" });
        return;
      }

      next();
    } catch (error) {
      logger.error(`[ERROR] Msg: ${token}`);
      if (error instanceof Error) {
        if (error.name === "TokenExpiredError") {
          res
            .status(HttpStatus.FORBIDDEN)
            .json({ message: "Token is expired" });
        } else {
          res
            .status(HttpStatus.FORBIDDEN)
            .json({ message: "Token is not valid" });
        }
      } else {
        res
          .status(HttpStatus.SERVER_ERROR)
          .json({ message: "An unknown error occurred" });
      }
      return;
    }
  }
};
