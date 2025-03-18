import mongoose, { Model } from "mongoose";
import { IProduct } from "./product.interface";
import { ICategory } from "../category";
import { Product } from "./product.model";
import { User } from "../user";
import { Category } from "../category/category.model";
import { IError } from "../../core/interfaces";
import { CreateProductDto } from "./dtos/create.dto";
import { UpdateProductDto } from "./dtos/update.dto";
import { isEmptyObject, checkValidUrl } from "../../core/utils";
import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import { IUser } from "../user/user.interface";

export class ProductService {
  public productSchema: Model<IProduct> = Product;
  public categorySchema: Model<ICategory> = Category;
  public userSchema: Model<IUser> = User;

  public create = async (
    user_id: string,
    model: CreateProductDto
  ): Promise<IProduct> => {
    try {
      if (isEmptyObject(model)) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "No data provided");
      }

      const user = await this.userSchema.findOne({ _id: user_id });
      if (!user) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "User not found");
      }

      const errorResults: IError[] = [];

      // validate category
      const category = await this.categorySchema.findOne({
        _id: model.category_id,
      });
      if (!category) {
        errorResults.push({
          message: "Category does not exist",
          field: "category_id",
        });
      }

      // validate discount and price
      if (model.discount > model.price) {
        errorResults.push({
          field: "discount",
          message: "Discount cannot be greater than price",
        });
      }

      if (model.discount < 0 || model.discount > 100) {
        errorResults.push({
          field: "discount",
          message: "Discount must be between 0 and 100",
        });
      }

      // validate price
      if (model.price < 0) {
        errorResults.push({
          field: "price",
          message: "Price cannot be negative",
        });
      }

      if (model.discount < 0) {
        errorResults.push({
          field: "discount",
          message: "Discount cannot be negative",
        });
      }

      // validate image URL
      if (model.image_url && !checkValidUrl(model.image_url)) {
        errorResults.push({
          field: "image_url",
          message: "Image URL is invalid",
        });
      }

      if (errorResults.length) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          "Validation errors",
          errorResults
        );
      }

      // Attempt to create the product
      const product = await this.productSchema.create({
        ...model,
        user_id: user_id,
      });
      return product;
    } catch (error: any) {
      throw new HttpException(
        HttpStatus.SERVER_ERROR,
        `Failed to create product: ${error.message}`,
        error.errors
      );
    }
  };

  public getItems = async (): Promise<IProduct[]> => {
    try {
      const products = await this.productSchema.find();
      return products;
    } catch (error: any) {
      throw new Error(`Failed to find products: ${error.message}`);
    }
  };

  public getItemById = async (id: string): Promise<IProduct> => {
    try {
      const product = await this.productSchema.findOne({ _id: id });
      if (!product) {
        throw new HttpException(HttpStatus.NOT_FOUND, "Product not found");
      }
      return product;
    } catch (error: any) {
      throw new HttpException(
        HttpStatus.SERVER_ERROR,
        `Failed to find product: ${error.message}`
      );
    }
  };

  public update = async (
    id: string,
    user_id: string,
    model: UpdateProductDto
  ): Promise<IProduct> => {
    try {
      if (isEmptyObject(model)) {
        throw new Error("No data provided");
      }

      const user = await this.userSchema.findOne({ _id: user_id });
      if (!user) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "User not found");
      }

      const errorResults: IError[] = [];

      // check if the category exists
      const category = await this.categorySchema.findOne({
        _id: model.category_id,
      });
      if (!category) {
        errorResults.push({
          field: "category_id",
          message: "Category does not exist",
        });
      }

      // check name is duplicate
      if (model.name.toLowerCase() !== model.name.toLowerCase()) {
        const itemDuplicate = await this.productSchema.findOne({
          name: model.name,
        });
        if (itemDuplicate) {
          errorResults.push({
            message: `Product with name is '${model.name}' already exists!`,
            field: "name",
          });
        }
      }

      // validate discount
      if (model.discount < 0 || model.discount > 100) {
        errorResults.push({
          field: "discount",
          message: "Discount must be between 0 and 100",
        });
      }

      // validate price
      if (model.price < 0 || model.price > 500) {
        errorResults.push({
          field: "price",
          message: "Price cannot be negative",
        });
      }

      if (errorResults.length) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          "Validation errors",
          errorResults
        );
      }

      const updateData = {
        ...model,
        user_id: user_id,
        updated_at: new Date(),
      };

      const updatedProduct = await this.productSchema.updateOne(
        { _id: id, user_id: user_id },
        updateData
      );

      if (!updatedProduct) {
        throw new Error("Product not found or could not be updated");
      }

      const result = await this.getItemById(id);
      if (!result) {
        throw new Error("Product not found");
      }
      return result;
    } catch (error: any) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  };

  public delete = async (id: string, user_id: string): Promise<boolean> => {
    try {
      if (isEmptyObject(id)) {
        throw new Error("No data provided");
      }

      const user = await this.userSchema.findOne({ _id: user_id });
      if (!user) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "User not found");
      }

      const errorResults: IError[] = [];

      const product = await this.productSchema.findById(id);
      if (!product) {
        errorResults.push({ message: "Product not found", field: "id" });
      }

      if (errorResults.length > 0) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          "Validation errors",
          errorResults
        );
      }

      const deletedProduct = await this.productSchema.deleteOne({
        _id: id,
        user_id: user_id,
      });
      if (!deletedProduct.acknowledged) {
        throw new Error("Product not found or could not be deleted");
      }

      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  };
}
