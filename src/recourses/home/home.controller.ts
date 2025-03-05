import { HttpStatus } from "./../../core/enums/http.enum";
import { UserRole } from "./../../modules/user/user.interface";
import { Request, Response } from "express";
import HomeService from "./home.service";
import LoginDto from "../../modules/auth/dtos/login.dto";
import AuthService from "../../modules/auth/auth.service";
import jwt from "jsonwebtoken";
import { title } from "process";

// import Auth
export default class HomeController {
  private homeService = new HomeService();
  private authService = new AuthService();

  private renderView(res: Response, view: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      res.render(view, data, (err: Error, html: string) => {
        if (err) reject(err);
        resolve(html);
      });
    });
  }

  private async renderWithSession(res: Response, view: string, data: any = {}) {
    return res.render("main", {
      ...data,
      session: res.locals.session || { user: null },
      content: await this.renderView(res, view, {
        ...data,
        session: res.locals.session || { user: null },
      }),
    });
  }

  public getLogin = async (req: Request, res: Response) => {
    try {
      res.render("main", {
        title: "Login",
        session: req.session,
        content: await this.renderView(res, "auth/login", {
          session: req.session,
        }),
      });
    } catch (error) {
      res.status(500).send("Error rendering login page");
    }
  };

  public postLogin = async (req: Request, res: Response) => {
    try {
      const loginData: LoginDto = req.body;
      const tokenData = await this.authService.login(loginData);

      // Decode the token to get user ID
      const decoded = jwt.verify(
        tokenData.access_token,
        process.env.JWT_TOKEN_SECRET!
      ) as { id: string };

      // Get user with the decoded ID
      const user = await this.authService.getCurrentLoginUser(decoded.id);

      // Store in session
      req.session.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
      };

      // Save session with Promise
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          }
          resolve();
        });
      });

      // Set session in res.locals for immediate access
      res.locals.session = {
        user: req.session.user,
      };
      return res.render("main", {
        title: "Welcome",
        session: req.session,
        content: "Welcome",
      });

      //   return res.redirect("/");
    } catch (error: any) {
      console.error("[Login Error]:", error);
      return res.render("main", {
        title: "Login",
        session: req.session,
        content: await this.renderView(res, "auth/login", {
          error: error.message || "Login failed",
        }),
      });
    }
  };

  public getHome = async (req: Request, res: Response) => {
    try {
      const data = await this.homeService.getHomeData();
      res.render("main", {
        title: "Welcome",
        session: req.session,
        content: await res.render(
          "home",
          {
            products: data.recentProducts || [],
            categories: data.popularCategories || [],
            session: req.session,
          },
          (err, html) => {
            if (err) {
              console.error("Error rendering home:", err);
              return "";
            }
            return html;
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
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.redirect("/login");
      });
    } catch (error) {
      console.error("Error in getLogout:", error);
      res.status(500).send("Error logging out");
    }
  };

  public getProducts = async (req: Request, res: Response) => {
    const products = await this.homeService.getAllProducts();
    await this.renderWithSession(res, "products/index", {
      title: "Products",
      products,
    });
  };

  public getCategories = async (req: Request, res: Response) => {
    const categories = await this.homeService.getAllCategories();
    await this.renderWithSession(res, "categories/index", {
      title: "Categories",
      categories,
    });
  };
}
