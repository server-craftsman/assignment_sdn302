import { Router } from "express";
import { IRoute } from "../../core/interfaces";
import CategoryController from "./category.controller";
import { userMiddleware } from "../../core/middleware";
import { UserRoleEnum } from "../../modules/user/user.enum";

export default class CategoryRouteFE implements IRoute {
  public path = "/categories";
  public router = Router();
  public categoryController = new CategoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // [GET] /categories
    this.router.get(
      this.path,
      userMiddleware(),
      this.categoryController.getCategories
    );

    // [GET] /categories/new
    this.router.get(
      `${this.path}/create`,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.categoryController.renderCreateCategoryPage
    );

    // [GET] /categories/
    this.router.get(
      `${this.path}/:id/update`,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.categoryController.renderUpdateCategoryPage
    );

    // [POST] /categories
    this.router.post(
      this.path,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.categoryController.createCategory
    );

    // [GET] /categories/:id
    this.router.get(
      `${this.path}/:id`,
      userMiddleware(),
      this.categoryController.getCategory
    );

    // [PUT] /categories/:id
    this.router.put(
      `${this.path}/:id`,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.categoryController.updateCategory
    );

    // [DELETE] /categories/:id
    this.router.delete(
      `${this.path}/:id`,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.categoryController.deleteCategory
    );
  }
}
