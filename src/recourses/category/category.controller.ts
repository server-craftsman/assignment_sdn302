import { Request, Response } from "express";
import CategoryServiceFE from "./category.service";
import { CreateCategoryDto } from "../../modules/category/dtos/create.dto";
import { UpdateCategoryDto } from "../../modules/category/dtos/update.dto";
import { ICategory } from "../../modules/category/category.interface";
import { RenderTemplateEngine } from "../../core/utils";

export default class CategoryController {
  private categoryService = new CategoryServiceFE();
  private renderTemplateEngine = new RenderTemplateEngine();

  public renderCreateCategoryPage = async (req: Request, res: Response) => {
    await this.renderTemplateEngine.renderWithSession(
      req,
      res,
      "categories/create",
      {
        title: "Create Category",
      }
    );
  };

  public getCategories = async (req: Request, res: Response) => {
    const categories = await this.categoryService.getCategories();
    await this.renderTemplateEngine.renderWithSession(
      req,
      res,
      "categories/index",
      {
        title: "Categories",
        session: req.session,
        categories,
      }
    );
  };

  public getCategory = async (req: Request, res: Response) => {
    const category = await this.categoryService.getCategory(req.params.id);
    await this.renderTemplateEngine.renderWithSession(
      req,
      res,
      "categories/details",
      {
        title: "Category",
        session: req.session,
        category,
      }
    );
  };

  public createCategory = async (req: Request, res: Response) => {
    try {
      const model: CreateCategoryDto = new CreateCategoryDto(req.body);
      const user_id = req.session?.user?.id;
      await this.categoryService.createCategory(user_id, model);
      res.redirect("/categories");
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).send("Error creating category");
    }
  };

  public renderUpdateCategoryPage = async (req: Request, res: Response) => {
    const category = await this.categoryService.getCategory(req.params.id);
    await this.renderTemplateEngine.renderWithSession(
      req,
      res,
      "categories/update",
      {
        title: "Category",
        category,
      }
    );
  };

  public updateCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user_id = req.session?.user?.id;
      const updateCategoryDto = new UpdateCategoryDto(req.body);
      await this.categoryService.updateCategory(id, user_id, updateCategoryDto);
      console.log(updateCategoryDto);
      res.redirect("/categories");
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).send("Error updating category");
    }
  };
  public deleteCategory = async (req: Request, res: Response) => {
    try {
      const user_id = req.session?.user?.id; // Use the same pattern as in other methods
      if (!user_id) {
        throw new Error("User ID is required");
      }
      await this.categoryService.deleteCategory(req.params.id, user_id);
      res.redirect("/categories");
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).send("Error deleting category");
    }
  };
}
