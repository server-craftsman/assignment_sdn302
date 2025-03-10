import { Router } from "express";
import { IRoute } from "../../core/interfaces";
import HomeController from "./home.controller";
import { userMiddleware } from "../../core/middleware";

export default class HomeRoute implements IRoute {
  public path = "/";
  public router = Router();
  public homeController = new HomeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public routes
    this.router.get(this.path, this.homeController.getHome);
    this.router.get("/login", this.homeController.getLogin);
    this.router.post("/login", this.homeController.postLogin);
    this.router.get("/logout", this.homeController.getLogout);

    // Protected routes
    this.router.get(
      "/profile",
      userMiddleware(),
      this.homeController.getProfile
    );
  }
}
