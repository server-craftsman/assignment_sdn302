import { RenderTemplateEngine } from "../../core/utils";
import { Request, Response } from "express";
import ProductService from "./product.service";
import { CreateProductDto, UpdateProductDto } from "../../modules/product";

export default class ProductControllerFE {
  private productService = new ProductService();
  private renderTemplateEngine = new RenderTemplateEngine();

  public renderCreateProductPage = async (req: Request, res: Response) => {
    try {
      const categories = await this.productService.getCategories();
      await this.renderTemplateEngine.renderWithSession(
        req,
        res,
        "products/create",
        {
          title: "Create Product",
          categories,
        }
      );
    } catch (error) {
      console.error("Error rendering create product page:", error);
      res.status(500).send("Error rendering create product page");
    }
  };
  public getProducts = async (req: Request, res: Response) => {
    const products = await this.productService.getItems();
    await this.renderTemplateEngine.renderWithSession(
      req,
      res,
      "products/index",
      {
        title: "Products",
        products,
      }
    );
  };

  public getProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Handle special routes
      if (id === "create") {
        return this.renderCreateProductPage(req, res);
      }

      const product = await this.productService.getItemById(id);
      await this.renderTemplateEngine.renderWithSession(
        req,
        res,
        "products/details",
        {
          title: "Product",
          product,
        }
      );
    } catch (error) {
      console.error("Error getting product:", error);
      res.status(500).send("Error getting product");
    }
  };
  public createProduct = async (req: Request, res: Response) => {
    try {
      const model: CreateProductDto = new CreateProductDto(req.body);
      const user_id = req.session?.user?.id;
      await this.productService.create(user_id, model);
      res.redirect("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).send("Error creating product");
    }
  };

  public renderUpdateProductPage = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.getItemById(req.params.id);
      const categories = await this.productService.getCategories();

      await this.renderTemplateEngine.renderWithSession(
        req,
        res,
        "products/update",
        {
          title: "Product",
          product,
          categories,
        }
      );
    } catch (error) {
      console.error("Error rendering update product page:", error);
      res.status(500).send("Error rendering update product page");
    }
  };

  public updateProduct = async (req: Request, res: Response) => {
    try {
      const user_id = req.session?.user?.id;
      const updateProductDto = new UpdateProductDto(req.body);
      await this.productService.update(
        req.params.id,
        user_id,
        updateProductDto
      );
      res.redirect("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Error updating product");
    }
  };

  public deleteProduct = async (req: Request, res: Response) => {
    try {
      const user_id = req.session?.user?.id;
      await this.productService.delete(req.params.id, user_id);
      res.redirect("/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).send("Error deleting product");
    }
  };
}
