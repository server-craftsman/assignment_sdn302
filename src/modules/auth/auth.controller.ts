import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../core/enums";
import { formatResponse } from "../../core/utils";
import { IUser } from "../user";
import { TokenData } from "./auth.interface";
import AuthService from "./auth.service";
import LoginDto from "./dtos/login.dto";
import jwt from "jsonwebtoken";
import { logger } from "../../core/utils";

export default class AuthController {
  private authService = new AuthService();

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: LoginDto = req.body;
      const tokenData: TokenData = await this.authService.login(model);

      // Set cookies first
      res.cookie("access_token", tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
        path: "/",
        sameSite: "strict",
      });

      res.cookie("refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
        sameSite: "strict",
      });

      const user = await this.authService.getCurrentLoginUser(
        tokenData.access_token
      );

      // Set session synchronously
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      // Use await to ensure session is saved
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          resolve();
        });
      });

      res.redirect("/");
    } catch (error: any) {
      return res.render("main", {
        title: "Login",
        content: await res.render(
          "auth/login",
          {
            error: error.message || "Login failed",
          },
          (err, html) => html
        ),
      });
    }
  };

  public getCurrentLoginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.cookies.access_token;
      const user: IUser = await this.authService.getCurrentLoginUser(token);

      // Update session with latest user data
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      res.status(HttpStatus.OK).json(formatResponse<IUser>(user));
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clear session first
      req.session.destroy((err) => {
        if (err) {
          logger.error(`[Logout] Session destruction failed: ${err}`);
        }
        
        // Clear cookies
        res.clearCookie("access_token", { path: "/" });
        res.clearCookie("refresh_token", { path: "/" });
        
        // Redirect to login page
        res.redirect("/login");
      });
    } catch (error) {
      logger.error(`[Logout] Error: ${error}`);
      // Ensure cookies are cleared even if there's an error
      res.clearCookie("access_token", { path: "/" });
      res.clearCookie("refresh_token", { path: "/" });
      res.redirect("/login");
    }
  };

  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tokenData: TokenData = await this.authService.refreshToken(
        req.body.refresh_token
      );
      res.status(HttpStatus.OK).json(formatResponse<TokenData>(tokenData));
    } catch (error) {
      next(error);
    }
  };
}
