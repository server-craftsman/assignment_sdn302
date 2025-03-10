import { ProductService } from "../../modules/product";
import { CreateProductDto, UpdateProductDto } from "../../modules/product";
import { CategoryService } from "../../modules/category";
import mongoose from "mongoose";

export default class ProductServiceFE {
  private productService = new ProductService();
  private categoryService = new CategoryService();

  public getItems = async () => {
    return await this.productService.getItems();
  };

  public getCategories = async () => {
    return await this.categoryService.getItems();
  };

  public getItemById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid product ID: ${id}`);
    }

    const product = await this.productService.getItemById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  };

  public create = async (
    user_id: string | undefined,
    model: CreateProductDto
  ) => {
    if (!user_id) throw new Error("User ID is required");
    if (!mongoose.Types.ObjectId.isValid(model.category_id)) {
      throw new Error("Invalid category ID format");
    }

    const category = await this.categoryService.getItemById(model.category_id);
    if (!category) throw new Error("Category not found");

    model.category_id = category._id as string;
    if (!model.category_id) throw new Error("Invalid product data");

    return this.productService.create(user_id, model);
  };

  public update = async (
    id: string,
    user_id: string | undefined,
    product: UpdateProductDto
  ) => {
    if (!user_id) throw new Error("User ID is required");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }
    return await this.productService.update(id, user_id, product);
  };

  public delete = async (id: string, user_id: string | undefined) => {
    if (!user_id) throw new Error("User ID is required");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }
    return await this.productService.delete(id, user_id);
  };
}
