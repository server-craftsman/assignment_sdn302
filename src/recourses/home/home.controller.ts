import { Request, Response } from "express";
import HomeService from "./home.service";

// import Auth
export default class HomeController {
  private homeService = new HomeService();

  private renderView(res: Response, view: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      res.render(view, data, (err: Error, html: string) => {
        if (err) reject(err);
        resolve(html);
      });
    });
  }

  public getHome = async (req: Request, res: Response) => {
    const data = await this.homeService.getHomeData();
    res.render("main", {
      title: "Welcome",
      content: await res.render(
        "home",
        {
          user: req.user,
          products: data.recentProducts,
          categories: data.popularCategories,
        },
        (err, html) => html
      ),
    });
  };

  public getLogin = async (req: Request, res: Response) => {
    try {
      res.render("auth/login", { title: "Login" });
    } catch (error) {
      res.status(500).send("Error rendering login page");
    }
  };

  public getProducts = async (req: Request, res: Response) => {
    const products = await this.homeService.getAllProducts();
    res.render("main", {
      title: "Products",
      content: await res.render(
        "products/index",
        {
          products,
          user: req.user,
        },
        (err, html) => html
      ),
    });
  };

  public getCategories = async (req: Request, res: Response) => {
    const categories = await this.homeService.getAllCategories();
    res.render("main", {
      title: "Categories",
      content: await res.render(
        "categories/index",
        {
          categories,
          user: req.user,
        },
        (err, html) => html
      ),
    });
  };
}
