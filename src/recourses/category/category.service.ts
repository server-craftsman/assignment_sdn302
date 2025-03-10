import { CategoryService } from "../../modules/category";
import { CreateCategoryDto } from "../../modules/category/dtos/create.dto";

export default class CategoryServiceFE {
  private categoryService = new CategoryService();

  public getCategories = async () => {
    return await this.categoryService.getItems();
  };

  public getCategory = async (id: string) => {
    return await this.categoryService.getItemById(id);
  };

  public createCategory = async (
    user_id: string | undefined,
    category: CreateCategoryDto
  ) => {
    console.log(category);
    if (!user_id) {
      throw new Error("User ID is required");
    }
    return await this.categoryService.create(user_id, category);
  };

  public updateCategory = async (
    id: string,
    user_id: string | undefined,
    category: CreateCategoryDto
  ) => {
    if (!user_id) {
      throw new Error("User ID is required");
    }
    return await this.categoryService.update(id, user_id, category);
    
  };

  public deleteCategory = async (id: string, user_id: string) => {
    return await this.categoryService.delete(id, user_id);
  };
}
