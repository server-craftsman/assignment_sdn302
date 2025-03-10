import { Request, Response, NextFunction } from "express";
import CategoryService from "./category.service";
import { CreateCategoryDto } from "./dtos/create.dto";
import { UpdateCategoryDto } from "./dtos/update.dto";
import { formatResponse } from "../../core/utils";
import { HttpStatus } from "../../core/enums";
import { ICategory } from "./category.interface";

export default class CategoryController {
  private categoryService = new CategoryService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: CreateCategoryDto = new CreateCategoryDto(req.body);
      const category: ICategory = await this.categoryService.create(
        req.user.id,
        model
      );
      res.status(HttpStatus.CREATED).json(formatResponse(category));
    } catch (error) {
      next(error);
    }
  };

  public getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getItems();
      res.status(HttpStatus.OK).json(formatResponse(categories));
    } catch (error) {
      next(error);
    }
  };

  public getItemById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.searchCategoryWithProducts(
        id
      );
      res.status(HttpStatus.OK).json(formatResponse(category));
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateCategoryDto = new UpdateCategoryDto(req.body);
      const updatedCategory = await this.categoryService.update(
        id,
        req.user.id,
        updateCategoryDto
      );
      res.status(HttpStatus.OK).json(formatResponse(updatedCategory));
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.categoryService.delete(id, req.user.id);
      res
        .status(HttpStatus.OK)
        .json(formatResponse<string>("Delete category successfully"));
    } catch (error) {
      next(error);
    }
  };

  public getProductsByCategoryId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const products = await this.categoryService.searchCategoryWithProducts(
        id
      );
      res.status(HttpStatus.OK).json(formatResponse(products));
    } catch (error) {
      next(error);
    }
  };
}
