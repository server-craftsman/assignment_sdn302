import { HttpStatus } from "./../../core/enums";
import { HttpException } from "../../core/exceptions";
import { UserRole } from "./../../modules/user/user.interface";
import { Request, Response, NextFunction } from "express";
import HomeService from "./home.service";
import LoginDto from "../../modules/auth/dtos/login.dto";
import AuthService from "../../modules/auth/auth.service";
import jwt from "jsonwebtoken";
import { RenderTemplateEngine } from "../../core/utils";
import { session } from "passport";

// import Auth
export default class HomeController {
  private homeService = new HomeService();
  private authService = new AuthService();
  private renderTemplateEngine = new RenderTemplateEngine();

  public getLogin = async (req: Request, res: Response) => {
    try {
      res.render("main", {
        title: "Login",
        session: req.session,
        content: await this.renderTemplateEngine.renderWithSession(
          req,
          res,
          "auth/login",
          {
            session: req.session,
          }
        ),
      });
    } catch (error) {
      res.status(500).send("Error rendering login page");
    }
  };

  public postLogin = async (req: Request, res: Response) => {
    try {
      const loginData: LoginDto = req.body;
      const tokenData = await this.authService.login(loginData);

      const decoded = jwt.verify(
        tokenData.access_token,
        process.env.JWT_TOKEN_SECRET!
      ) as {
        id: string;
        role: UserRole;
        version: number;
        access_token: string;
        name: string;
        email: string;
      };

      const user = await this.authService.getCurrentLoginUser(decoded.id);

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        access_token: tokenData.access_token,
      };

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          }
          resolve();
        });
      });

      return res.render("main", {
        title: "Welcome",
        session: req.session,
        content: await this.renderTemplateEngine.renderWithSession(
          req,
          res,
          "home",
          {
            session: req.session,
          }
        ),
      });
    } catch (error: any) {
      console.error("[Login Error]:", error);
      return res.render("main", {
        title: "Login",
        session: req.session,
        content: await this.renderTemplateEngine.renderWithSession(
          req,
          res,
          "auth/login",
          {
            error: error.message || "Login failed",
          }
        ),
      });
    }
  };

  public getHome = async (req: Request, res: Response) => {
    try {
      res.render("main", {
        title: "Welcome",
        session: req.session,
        content: await this.renderTemplateEngine.renderWithSession(
          req,
          res,
          "home",
          {
            session: req.session,
          }
        ),
      });
    } catch (error) {
      console.error("Error in getHome:", error);
      res.status(500).send("Error loading home page");
    }
  };

  public getLogout = async (req: Request, res: Response) => {
    try {
      await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            console.error("Session destroy error:", err);
            reject(err);
          }
          resolve();
        });
      });

      if (req.user?.id) {
        await this.homeService.logout(req.user.id);
      }
      return res.redirect("/login");
    } catch (error) {
      console.error("Error in getLogout:", error);
      return res.status(500).render("main", {
        title: "Error",
        content: "An error occurred while logging out. Please try again.",
      });
    }
  };

  public getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.session?.user?.id) {
        res.status(HttpStatus.UNAUTHORIZED).send("Unauthorized");
        return;
      }
      const user = await this.authService.getCurrentLoginUser(
        req.session.user.id
      );
      await this.renderTemplateEngine.renderWithSession(
        req,
        res,
        "profile/index",
        {
          title: "Profile",
          session: req.session,
          user,
        }
      );
    } catch (error) {
      next(error);
    }
  };
}
