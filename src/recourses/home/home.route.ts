import { Router } from "express";
import { IRoute } from "../../core/interfaces";
import HomeController from "./home.controller";
import { userMiddleware } from "../../core/middleware";
import { UserRoleEnum } from "../../modules/user/user.enum";

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
    // Register routes
    this.router.get("/register", this.homeController.getCreateUser);
    this.router.post(
      "/register",
      userMiddleware([UserRoleEnum.ADMIN]),
      this.homeController.createUser
    );
    this.router.get("/logout", this.homeController.getLogout);

    // Protected routes
    this.router.get(
      "/profile",
      userMiddleware(),
      this.homeController.getProfile
    );
  }
}
