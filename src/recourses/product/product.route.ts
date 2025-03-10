import { Router } from "express";
import { IRoute } from "../../core/interfaces";
import ProductController from "./product.controller";
import { userMiddleware } from "../../core/middleware";
import { UserRoleEnum } from "../../modules/user/user.enum";

export default class ProductRouteFE implements IRoute {
  public path = "/products";
  public router = Router();
  public productController = new ProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // [GET] /products
    this.router.get(
      `${this.path}`,
      userMiddleware(),
      this.productController.getProducts
    );
    // [GET] /products/:id
    this.router.get(
      `${this.path}/:id`,
      userMiddleware(),
      this.productController.getProduct
    );
    // [GET] /products/create
    this.router.get(
      `${this.path}/create`,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.productController.renderCreateProductPage
    );
    // [POST] /products
    this.router.post(
      this.path,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.productController.createProduct
    );
    // [GET] /products/:id/update
    this.router.get(
      `${this.path}/:id/update`,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.productController.renderUpdateProductPage
    );
    // [PUT] /products/:id
    this.router.put(
      `${this.path}/:id`,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.productController.updateProduct
    );
    // [DELETE] /products/:id
    this.router.delete(
      `${this.path}/:id`,
      userMiddleware([UserRoleEnum.ADMIN]),
      this.productController.deleteProduct
    );
  }
}
